import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import { generateTicket } from "@/features/game/lib/ticket-generator";

const joinGameSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(20, "Name is too long"),
  code: z.string().optional(), // For joining via code if needed, though URL param usually handles it
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { name } = joinGameSchema.parse(body);

    // 1. Check if game exists and is joinable
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: true,
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    if (game.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Game has already ended" },
        { status: 400 }
      );
    }

    if (game.players.length >= game.maxPlayers) {
      return NextResponse.json(
        { error: "Game is full" },
        { status: 400 }
      );
    }

    // 2. Check if player already exists (optional, for idempotency within session)
    // For now, we assume a new join request means a new player (or re-join)
    // We explicitly allow multiple players with same name for guests?
    // Better to handle re-joins if we had sessions, but for MVP/Guest:
    // If name exists, maybe append ID or allow? AC says nothing.
    // We will just create a new player record.

    // 3. Generate Ticket
    // This is synchronous and CPU-bound but fast enough for single ticket
    const ticketGrid = generateTicket();

    // 4. Transaction: Create Player and Ticket
    const { player, ticket } = await prisma.$transaction(
      async (tx) => {
        const player = await tx.player.create({
          data: {
            gameId,
            name,
          },
        });

        const ticket = await tx.ticket.create({
          data: {
            gameId,
            playerId: player.id,
            grid: ticketGrid, // Prisma Json type
          },
        });

        return { player, ticket };
      }
    );

    // 5. Broadcast Event
    await pusherServer.trigger(`game-${gameId}`, "player:joined", {
      player: {
        id: player.id,
        name: player.name,
        joinedAt: player.joinedAt,
      },
    });

    // 6. Return success
    // Generate a simple session token for the client (MVP)
    // In a real app we might set a cookie here, but AC asks for token return
    const token = nanoid();

    return NextResponse.json({
      data: {
        player,
        ticket,
        token,
      },
    });
  } catch (error: unknown) {
    console.error("Join game error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
