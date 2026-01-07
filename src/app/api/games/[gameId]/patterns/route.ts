import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { gamePatternSchema } from "@/features/game/lib/validation";
import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ gameId: string }> }
) {
  try {
    const params = await props.params;
    const { gameId } = params;

    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = gamePatternSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { patterns } = validation.data;

    // Verify host ownership
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { hostId: true, status: true },
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

    if (game.status !== "CONFIGURING" && game.status !== "LOBBY") {
      return NextResponse.json(
        {
          error: "Cannot modify patterns after game has started",
        },
        { status: 400 }
      );
    }

    // Transaction: Replace patterns
    await prisma.$transaction([
      prisma.gamePattern.deleteMany({
        where: { gameId },
      }),
      prisma.gamePattern.createMany({
        data: patterns.map((p) => ({
          gameId,
          pattern: p.pattern,
          enabled: p.enabled,
          points1st: p.points1st,
          points2nd: p.points2nd,
          points3rd: p.points3rd,
        })),
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating game patterns:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
