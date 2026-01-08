import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    // 1. Verify user is authenticated
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Fetch game with player count
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        _count: {
          select: { players: true },
        },
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // 3. Verify user is the host
    if (game.hostId !== session.user.id) {
      return NextResponse.json(
        {
          error: "Only the host can start the game",
          code: "UNAUTHORIZED",
        },
        { status: 403 }
      );
    }

    // 4. Check game status
    if (game.status === "STARTED") {
      return NextResponse.json(
        {
          error: "Game has already started",
          code: "GAME_ALREADY_STARTED",
        },
        { status: 400 }
      );
    }

    if (game.status === "COMPLETED") {
      return NextResponse.json(
        {
          error: "Game has already ended",
          code: "GAME_COMPLETED",
        },
        { status: 400 }
      );
    }

    // 5. Check minimum player count
    const playerCount = game._count.players;
    if (playerCount < game.minPlayers) {
      return NextResponse.json(
        {
          error: `Minimum ${game.minPlayers} players required. Currently ${playerCount} joined.`,
          code: "MIN_PLAYERS_NOT_MET",
        },
        { status: 400 }
      );
    }

    // 6. Update game status to STARTED
    const startedAt = new Date();
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        status: "STARTED",
      },
    });

    // 7. Broadcast game:started event via Pusher
    await pusherServer.trigger(`game-${gameId}`, "game:started", {
      gameId,
      startedAt: startedAt.toISOString(),
    });

    // 8. Return success response
    return NextResponse.json({
      data: {
        gameId: updatedGame.id,
        status: updatedGame.status,
        startedAt: startedAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Start game error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
