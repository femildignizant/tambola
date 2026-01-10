import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const lookupSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be exactly 6 characters")
    .regex(/^[A-Z0-9]+$/i, "Code must be alphanumeric"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = lookupSchema.parse(body);

    const game = await prisma.game.findFirst({
      where: {
        gameCode: { equals: code, mode: "insensitive" },
      },
      include: {
        _count: { select: { players: true } },
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found. Check your code and try again." },
        { status: 404 }
      );
    }

    if (game.status === "COMPLETED") {
      return NextResponse.json(
        { error: "This game has already ended." },
        { status: 400 }
      );
    }

    if (game.status === "STARTED") {
      return NextResponse.json(
        {
          error:
            "This game has already started. You cannot join now.",
        },
        { status: 400 }
      );
    }

    if (game._count.players >= game.maxPlayers) {
      return NextResponse.json(
        { error: "This game is full." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: {
        gameId: game.id,
        title: game.title,
        status: game.status,
        playerCount: game._count.players,
        maxPlayers: game.maxPlayers,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid code format" },
        { status: 400 }
      );
    }
    console.error("Lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
