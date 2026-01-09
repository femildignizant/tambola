import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

/**
 * POST /api/games/[gameId]/end
 * Force stops a game immediately. Only the host can end the game.
 * Broadcasts game:ended event with reason "FORCE_STOP".
 */
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

    // 2. Fetch game
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        hostId: true,
        status: true,
        currentSequence: true,
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
          error: "Only the host can end the game",
          code: "UNAUTHORIZED",
        },
        { status: 403 }
      );
    }

    // 4. Check game status - only STARTED games can be ended
    if (game.status !== "STARTED") {
      return NextResponse.json(
        {
          error: "Game must be in progress to end it",
          code: "INVALID_GAME_STATUS",
        },
        { status: 400 }
      );
    }

    // 5. Update game status to COMPLETED
    const completedAt = new Date();
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        status: "COMPLETED",
        completedAt: completedAt,
      },
    });

    // 6. Broadcast game:ended event via Pusher
    await pusherServer.trigger(`game-${gameId}`, "game:ended", {
      reason: "FORCE_STOP",
      finalSequence: game.currentSequence,
      completedAt: completedAt.toISOString(),
    });

    // 7. Return success response
    return NextResponse.json({
      data: {
        gameId: updatedGame.id,
        status: updatedGame.status,
        reason: "FORCE_STOP",
        completedAt: completedAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("End game error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
