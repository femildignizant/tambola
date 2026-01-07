import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { gameSettingsSchema } from "@/features/game/lib/validation";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    if (game.hostId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const validation = gameSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { numberInterval, minPlayers, maxPlayers } =
      validation.data;

    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        numberInterval,
        minPlayers,
        maxPlayers,
      },
    });

    return NextResponse.json({ data: updatedGame });
  } catch (error) {
    console.error("Update game settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
