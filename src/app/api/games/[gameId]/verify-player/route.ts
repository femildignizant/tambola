import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // For MVP: Find the first player in this game
    // In production, implement proper token verification with JWT or session management

    const player = await prisma.player.findFirst({
      where: {
        gameId,
      },
      include: {
        tickets: {
          select: {
            id: true,
            grid: true,
          },
          take: 1,
        },
      },
    });

    if (!player || !player.tickets || player.tickets.length === 0) {
      return NextResponse.json(
        { error: "Invalid token or player not found" },
        { status: 404 }
      );
    }

    const ticket = player.tickets[0];

    return NextResponse.json({
      data: {
        player: {
          id: player.id,
          name: player.name,
          joinedAt: player.joinedAt.toISOString(),
        },
        ticket: {
          id: ticket.id,
          grid: ticket.grid,
        },
        token,
      },
    });
  } catch (error: unknown) {
    console.error("Error verifying player:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
