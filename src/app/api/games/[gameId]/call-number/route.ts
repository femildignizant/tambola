import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import {
  getNextNumber,
  isGameComplete,
  getRemainingCount,
} from "@/features/game/lib/number-generator";

interface RouteParams {
  params: Promise<{ gameId: string }>;
}

/**
 * POST /api/games/[gameId]/call-number
 * Calls the next number in a started game.
 * Only works when game is in STARTED status.
 * Broadcasts number:called or game:ended event via Pusher.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { gameId } = await params;

    // Fetch game state
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        status: true,
        calledNumbers: true,
        currentSequence: true,
        numberInterval: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.status !== "STARTED") {
      return NextResponse.json(
        {
          error: "Game is not in progress",
          code: "GAME_NOT_STARTED",
        },
        { status: 400 }
      );
    }

    // Check if game is already complete
    if (isGameComplete(game.calledNumbers)) {
      return NextResponse.json({
        data: {
          ended: true,
          finalSequence: game.currentSequence,
        },
      });
    }

    // Generate next number using cryptographically secure random
    const nextNumber = getNextNumber(game.calledNumbers);

    if (nextNumber === null) {
      // Should not happen if isGameComplete check passed, but handle defensively
      return NextResponse.json({
        data: {
          ended: true,
          finalSequence: game.currentSequence,
        },
      });
    }

    const newSequence = game.currentSequence + 1;
    const timestamp = new Date().toISOString();
    const newCalledNumbers = [...game.calledNumbers, nextNumber];
    const remaining = getRemainingCount(newCalledNumbers);

    // Check if this completes the game (all 90 numbers called)
    const gameEnds = isGameComplete(newCalledNumbers);

    // Update game atomically with optimistic concurrency control
    try {
      await prisma.game.update({
        where: {
          id: gameId,
          currentSequence: game.currentSequence, // Optimistic lock: ensure sequence hasn't changed
        },
        data: {
          calledNumbers: newCalledNumbers,
          currentSequence: newSequence,
          ...(gameEnds && {
            status: "COMPLETED",
            completedAt: new Date(),
          }),
        },
      });
    } catch (error: any) {
      // P2025 = Record to update not found. This means currentSequence changed.
      if (error.code === "P2025") {
        return NextResponse.json(
          {
            error: "Race condition detected. Please retry.",
            code: "CONCURRENT_UPDATE",
          },
          { status: 409 }
        );
      }
      throw error;
    }

    // Broadcast to all players via Pusher
    // Note: We broadcast even if we might have failed the DB update in a very rare edge case
    // where DB succeeds but we crash before here. But with the try/catch above, we only reach here if DB success.
    if (gameEnds) {
      await pusherServer.trigger(`game-${gameId}`, "game:ended", {
        reason: "ALL_NUMBERS_CALLED",
        finalSequence: newSequence,
        completedAt: timestamp,
      });
    } else {
      await pusherServer.trigger(`game-${gameId}`, "number:called", {
        number: nextNumber,
        sequence: newSequence,
        timestamp,
        remaining,
      });
    }

    return NextResponse.json({
      data: {
        number: nextNumber,
        sequence: newSequence,
        timestamp,
        remaining,
        ended: gameEnds,
      },
    });
  } catch (error) {
    console.error("[CALL_NUMBER_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to call number" },
      { status: 500 }
    );
  }
}
