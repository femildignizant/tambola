import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createGameSchema } from "@/features/game/lib/validation";
import { generateGameCode } from "@/features/game/lib/utils";

export async function POST(req: Request) {
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

    const body = await req.json();
    const validation = createGameSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { title } = validation.data;
    let gameCode = generateGameCode();
    let isUnique = false;
    let retries = 0;
    const MAX_RETRIES = 3;

    // Retry loop for unique gameCode
    while (!isUnique && retries < MAX_RETRIES) {
      const existing = await prisma.game.findUnique({
        where: { gameCode },
      });

      if (!existing) {
        isUnique = true;
      } else {
        gameCode = generateGameCode();
        retries++;
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        {
          error:
            "Failed to generate unique game code. Please try again.",
        },
        { status: 500 }
      );
    }

    const game = await prisma.game.create({
      data: {
        title,
        hostId: session.user.id,
        gameCode,
        // Defaults for minPlayers, maxPlayers, numberInterval, status are handled by Prisma schema
        // Create default FULL_HOUSE pattern - it's mandatory and cannot be disabled
        patterns: {
          create: {
            pattern: "FULL_HOUSE",
            enabled: true,
            points1st: 100,
            points2nd: null,
            points3rd: null,
          },
        },
      },
    });

    return NextResponse.json(
      { data: { gameId: game.id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create game error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
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

    const games = await prisma.game.findMany({
      where: {
        hostId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        minPlayers: true,
        maxPlayers: true,
        gameCode: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: games }, { status: 200 });
  } catch (error) {
    console.error("Get games error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
