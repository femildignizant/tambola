import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Pattern } from "@/generated/prisma/client";

/**
 * Game History API - GET /api/games/history
 *
 * Returns list of completed games where the authenticated user participated
 * either as host or as a player.
 */

interface GameHistoryClaim {
  pattern: Pattern;
  rank: number;
  points: number;
}

interface GameHistoryItem {
  id: string;
  title: string;
  hostName: string;
  isHost: boolean;
  completedAt: string | null;
  playerCount: number;
  status: "won" | "participated" | "host-only";
  totalPoints: number;
  claims: GameHistoryClaim[];
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Query for games where user participated (as host OR as player)
    // Filter to only COMPLETED games
    const games = await prisma.game.findMany({
      where: {
        status: "COMPLETED",
        OR: [
          { hostId: userId }, // User is host
          { players: { some: { userId } } }, // User is player
        ],
      },
      include: {
        host: { select: { name: true } },
        players: {
          where: { userId }, // Only get this user's player record
          include: {
            claims: {
              select: {
                pattern: true,
                rank: true,
                points: true,
              },
            },
          },
        },
        _count: { select: { players: true } }, // Total player count
      },
      orderBy: { completedAt: "desc" },
    });

    // Transform database results to response format
    const historyItems: GameHistoryItem[] = games.map((game) => {
      const isHost = game.hostId === userId;
      const playerRecord = game.players[0]; // We only queried for this user's player

      // Determine status and calculate points
      let status: "won" | "participated" | "host-only";
      let totalPoints = 0;
      let claims: GameHistoryClaim[] = [];

      if (!playerRecord) {
        // User was only a host, not a player
        status = "host-only";
      } else {
        claims = playerRecord.claims.map((c) => ({
          pattern: c.pattern,
          rank: c.rank,
          points: c.points,
        }));
        totalPoints = claims.reduce((sum, c) => sum + c.points, 0);

        if (claims.length > 0) {
          status = "won";
        } else {
          status = "participated";
        }
      }

      return {
        id: game.id,
        title: game.title,
        hostName: game.host.name,
        isHost,
        completedAt: game.completedAt?.toISOString() ?? null,
        playerCount: game._count.players,
        status,
        totalPoints,
        claims,
      };
    });

    return NextResponse.json({ data: historyItems }, { status: 200 });
  } catch (error) {
    console.error("Get game history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
