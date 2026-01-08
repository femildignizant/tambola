import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import { auth } from "@/lib/auth"; // Removed as we use token auth
import { z } from "zod";

const markSchema = z.object({
  number: z.number().min(1).max(90),
  action: z.enum(["MARK", "UNMARK"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.substring(7);

    const body = await req.json();
    const validation = markSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { number, action } = validation.data;

    // Find player's ticket for this game using token
    const ticket = await prisma.ticket.findFirst({
      where: {
        gameId,
        player: {
          token,
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Update marked numbers
    let newMarkedNumbers = [...ticket.markedNumbers];
    if (action === "MARK") {
      if (!newMarkedNumbers.includes(number)) {
        newMarkedNumbers.push(number);
      }
    } else {
      newMarkedNumbers = newMarkedNumbers.filter((n) => n !== number);
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        markedNumbers: newMarkedNumbers,
      },
    });

    return NextResponse.json({ data: { markedNumbers: updatedTicket.markedNumbers } });
  } catch (error) {
    console.error("Error marking ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
