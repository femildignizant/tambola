import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { pusherServer } from "@/lib/pusher-server";
import { checkPattern } from "@/features/game/lib/claim-verifier";
import {
  ClaimPattern,
  CLAIM_PATTERN_TO_DB_PATTERN,
  CLAIM_LOCK_TTL_SECONDS,
} from "@/features/game/types/claims";
import type { Ticket } from "@/features/game/types";

const claimSchema = z.object({
  pattern: z.nativeEnum(ClaimPattern),
  playerId: z.string().min(1, "Player ID is required"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { pattern, playerId } = claimSchema.parse(body);

    // 1. AUTH: Verify player is in this game
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        tickets: {
          where: { gameId },
          take: 1,
        },
      },
    });

    if (!player || player.gameId !== gameId) {
      return NextResponse.json(
        { error: "Player not found in this game" },
        { status: 403 }
      );
    }

    if (player.tickets.length === 0) {
      return NextResponse.json(
        { error: "Player has no ticket in this game" },
        { status: 400 }
      );
    }

    const ticket = player.tickets[0];
    const ticketGrid = ticket.grid as Ticket;

    // 2. GAME STATE: Check if game is in STARTED state
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        status: true,
        calledNumbers: true,
        patterns: {
          where: {
            pattern: CLAIM_PATTERN_TO_DB_PATTERN[pattern],
            enabled: true,
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    if (game.status !== "STARTED") {
      return NextResponse.json(
        { error: "Game is not in progress" },
        { status: 400 }
      );
    }

    // 3. PATTERN AVAILABILITY: Check if pattern is enabled for this game
    const gamePattern = game.patterns[0];
    if (!gamePattern) {
      return NextResponse.json(
        { error: "This pattern is not enabled for this game" },
        { status: 400 }
      );
    }

    // 4. VERIFICATION: Check if the claim is valid using claim-verifier
    const verificationResult = checkPattern(
      ticketGrid,
      game.calledNumbers,
      pattern
    );

    if (!verificationResult.isValid) {
      return NextResponse.json(
        { error: "Invalid claim", reason: verificationResult.reason },
        { status: 400 }
      );
    }

    // 5. ATOMIC LOCK: Use Redis SETNX with TTL to prevent race conditions
    // Calculate max ranks allowed based on points configuration
    const maxRank = gamePattern.points3rd
      ? 3
      : gamePattern.points2nd
      ? 2
      : 1;

    // IMPORTANT: Query existing claims FIRST to know which ranks are already taken in DB
    // This prevents the race condition where Redis locks expire but claims exist in DB
    const existingClaims = await prisma.claim.findMany({
      where: {
        gameId,
        pattern: CLAIM_PATTERN_TO_DB_PATTERN[pattern],
      },
      select: { playerId: true, rank: true },
    });

    // Check if this player already claimed this pattern
    const playerAlreadyClaimed = existingClaims.some(
      (c) => c.playerId === playerId
    );
    if (playerAlreadyClaimed) {
      return NextResponse.json(
        { error: "You have already claimed this pattern" },
        { status: 400 }
      );
    }

    // Get ranks already claimed in DB
    const claimedRanksInDb = new Set(
      existingClaims.map((c) => c.rank)
    );

    // Check if all ranks are already claimed
    if (claimedRanksInDb.size >= maxRank) {
      return NextResponse.json(
        { error: "All winners have been claimed for this pattern" },
        { status: 400 }
      );
    }

    // Try to acquire lock ONLY for ranks not already claimed in DB
    let acquiredRank: number | null = null;
    let lockKey: string | null = null;

    for (let rankToTry = 1; rankToTry <= maxRank; rankToTry++) {
      // Skip ranks already claimed in DB
      if (claimedRanksInDb.has(rankToTry)) {
        continue;
      }

      const tryLockKey = `claim:${gameId}:${pattern}:${rankToTry}`;
      // Use SET with NX and EX for atomic lock with TTL
      const lockResult = await redis.set(tryLockKey, playerId, {
        nx: true, // Only set if not exists
        ex: CLAIM_LOCK_TTL_SECONDS, // TTL in seconds to prevent permanent locks
      });

      if (lockResult === "OK") {
        acquiredRank = rankToTry;
        lockKey = tryLockKey;
        break;
      }
    }

    if (acquiredRank === null || lockKey === null) {
      // All unclaimed ranks are currently locked by other players
      return NextResponse.json(
        {
          error:
            "Another player is currently claiming. Please try again.",
        },
        { status: 409 }
      );
    }

    // Double-check the rank wasn't claimed while we were acquiring the lock (belt and suspenders)
    const freshClaimCheck = await prisma.claim.findFirst({
      where: {
        gameId,
        pattern: CLAIM_PATTERN_TO_DB_PATTERN[pattern],
        rank: acquiredRank,
      },
    });

    if (freshClaimCheck) {
      // Release lock since rank was just claimed
      await redis.del(lockKey);
      return NextResponse.json(
        { error: "This prize was just claimed by another player" },
        { status: 409 }
      );
    }

    // 6. DB PERSISTENCE: Create the claim record
    const points =
      acquiredRank === 1
        ? gamePattern.points1st
        : acquiredRank === 2
        ? gamePattern.points2nd ?? gamePattern.points1st
        : gamePattern.points3rd ?? gamePattern.points1st;

    const claim = await prisma.claim.create({
      data: {
        gameId,
        playerId,
        pattern: CLAIM_PATTERN_TO_DB_PATTERN[pattern],
        rank: acquiredRank,
        points,
      },
    });

    // Release the Redis lock after successful claim
    if (lockKey) {
      await redis.del(lockKey);
    }

    // 7. PUSHER BROADCAST: Notify all players
    await pusherServer.trigger(`game-${gameId}`, "claim:accepted", {
      claim: {
        id: claim.id,
        playerId: claim.playerId,
        playerName: player.name,
        pattern,
        rank: claim.rank,
        points: claim.points,
        claimedAt: claim.claimedAt.toISOString(),
      },
    });

    // 8. FULL HOUSE: End game if this was a Full House claim (1st place)
    if (pattern === ClaimPattern.FULL_HOUSE && acquiredRank === 1) {
      // Update game status to COMPLETED
      await prisma.game.update({
        where: { id: gameId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Broadcast game:ended event
      await pusherServer.trigger(`game-${gameId}`, "game:ended", {
        reason: "FULL_HOUSE",
        winner: {
          playerId: claim.playerId,
          playerName: player.name,
          points: claim.points,
        },
        completedAt: new Date().toISOString(),
      });
    }

    // 9. Return success response
    return NextResponse.json({
      data: {
        claim: {
          id: claim.id,
          pattern,
          rank: claim.rank,
          points: claim.points,
        },
        verifiedNumbers: verificationResult.verifiedNumbers,
      },
    });
  } catch (error: unknown) {
    console.error("Claim error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch claim status for a game
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    const claims = await prisma.claim.findMany({
      where: { gameId },
      include: {
        player: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ pattern: "asc" }, { rank: "asc" }],
    });

    // Group claims by pattern for easier frontend consumption
    const claimsByPattern: Record<
      string,
      Array<{
        rank: number;
        points: number;
        playerId: string;
        playerName: string;
        claimedAt: string;
      }>
    > = {};

    for (const claim of claims) {
      const patternKey = claim.pattern;
      if (!claimsByPattern[patternKey]) {
        claimsByPattern[patternKey] = [];
      }
      claimsByPattern[patternKey].push({
        rank: claim.rank,
        points: claim.points,
        playerId: claim.playerId,
        playerName: claim.player.name,
        claimedAt: claim.claimedAt.toISOString(),
      });
    }

    return NextResponse.json({ data: claimsByPattern });
  } catch (error) {
    console.error("Get claims error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
