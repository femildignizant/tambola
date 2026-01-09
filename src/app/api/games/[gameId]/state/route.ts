import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * GET /api/games/[gameId]/state
 *
 * Returns complete game state for reconnection/state sync.
 * Used when a player reconnects or refreshes during an active game.
 *
 * Returns: game details, all called numbers, claims, and player-specific data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    // Get player token from Authorization header
    const token = request.headers
      .get("Authorization")
      ?.replace("Bearer ", "");

    // Get current session for host identification
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    // Fetch game with all necessary data for state sync
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        title: true,
        status: true,
        hostId: true,
        gameCode: true,
        numberInterval: true,
        calledNumbers: true,
        minPlayers: true,
        maxPlayers: true,
        host: {
          select: {
            id: true,
            name: true,
          },
        },
        patterns: {
          where: { enabled: true },
          select: {
            pattern: true,
            enabled: true,
            points1st: true,
            points2nd: true,
            points3rd: true,
          },
        },
        claims: {
          select: {
            id: true,
            pattern: true,
            rank: true,
            points: true,
            claimedAt: true,
            player: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            claimedAt: "asc",
          },
        },
        players: {
          select: {
            id: true,
            name: true,
            joinedAt: true,
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

    // Determine if session user is the host
    const isHost = session?.user?.id === game.hostId;

    // Initialize player data as null
    let playerData = null;

    // If a token is provided, verify and fetch player data
    if (token) {
      const player = await prisma.player.findFirst({
        where: {
          gameId,
          token,
        },
        select: {
          id: true,
          name: true,
          token: true,
          tickets: {
            select: {
              id: true,
              grid: true,
              markedNumbers: true,
            },
            take: 1, // Get only the first ticket (players have one ticket per game)
          },
        },
      });

      const ticket = player?.tickets?.[0];
      if (player && ticket) {
        playerData = {
          id: player.id,
          name: player.name,
          ticket: {
            id: ticket.id,
            grid: ticket.grid,
            markedNumbers: ticket.markedNumbers || [],
          },
        };
      }
    }

    // Format claims for client consumption
    const formattedClaims = game.claims.map((claim) => ({
      id: claim.id,
      pattern: claim.pattern,
      rank: claim.rank,
      points: claim.points,
      playerId: claim.player.id,
      playerName: claim.player.name,
      claimedAt: claim.claimedAt.toISOString(),
    }));

    // Calculate leaderboard from claims
    const leaderboardMap = new Map<
      string,
      { playerId: string; playerName: string; totalPoints: number }
    >();

    for (const claim of formattedClaims) {
      const existing = leaderboardMap.get(claim.playerId);
      if (existing) {
        existing.totalPoints += claim.points;
      } else {
        leaderboardMap.set(claim.playerId, {
          playerId: claim.playerId,
          playerName: claim.playerName,
          totalPoints: claim.points,
        });
      }
    }

    const leaderboard = Array.from(leaderboardMap.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    // Build response
    const responseData = {
      game: {
        id: game.id,
        title: game.title,
        status: game.status,
        hostId: game.hostId,
        hostName: game.host.name,
        gameCode: game.gameCode,
        numberInterval: game.numberInterval,
        minPlayers: game.minPlayers,
        maxPlayers: game.maxPlayers,
        patterns: game.patterns,
      },
      calledNumbers: game.calledNumbers,
      lastNumber:
        game.calledNumbers.length > 0
          ? game.calledNumbers[game.calledNumbers.length - 1]
          : null,
      claims: formattedClaims,
      leaderboard,
      players: game.players,
      isHost,
      player: playerData,
    };

    return NextResponse.json({ data: responseData });
  } catch (error) {
    console.error("Error fetching game state:", error);
    return NextResponse.json(
      { error: "Failed to fetch game state" },
      { status: 500 }
    );
  }
}
