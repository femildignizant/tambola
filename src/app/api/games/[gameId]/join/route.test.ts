import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import { NextRequest } from "next/server";
import type { Game, Player, Ticket } from "@/generated/prisma/client";

// Mock dependencies
// Mock dependencies
vi.mock("@/lib/prisma", () => {
  const mockPrisma = {
    game: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    player: {
      create: vi.fn(),
    },
    ticket: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(mockPrisma)),
  };
  // Handle circular reference for $transaction callback if needed,
  // but here we just need it to pass a "prisma-like" object.
  // Actually, we can just assign the function.

  return { default: mockPrisma };
});

vi.mock("@/lib/pusher-server", () => ({
  pusherServer: {
    trigger: vi.fn(),
  },
}));

vi.mock("@/features/game/lib/ticket-generator", () => ({
  generateTicket: vi.fn().mockReturnValue([
    [1, 2, 3, 4, 5],
    [null, null, null, null, null],
    [null, null, null, null, null],
  ]),
}));

describe("POST /api/games/[gameId]/join", () => {
  const gameId = "game-123";
  const params = Promise.resolve({ gameId });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully join a player and generate a ticket", async () => {
    // Setup mocks
    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: gameId,
      title: "Test Game",
      hostId: "host-123",
      status: "CONFIGURING",
      gameCode: "ABC123",
      numberInterval: 10,
      minPlayers: 2,
      maxPlayers: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      players: [],
    } as Game & { players: Player[] });

    const mockPlayer = {
      id: "p-1",
      name: "Alice",
      joinedAt: new Date(),
    };
    const mockTicket = { id: "t-1", grid: [[1]] };

    vi.mocked(prisma.player.create).mockResolvedValue(
      mockPlayer as Player
    );
    vi.mocked(prisma.ticket.create).mockResolvedValue(
      mockTicket as Ticket
    );

    const req = new NextRequest("http://localhost/api/join", {
      method: "POST",
      body: JSON.stringify({ name: "Alice" }),
    });

    const res = await POST(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.player).toEqual({
      ...mockPlayer,
      joinedAt: mockPlayer.joinedAt.toISOString(),
    });
    expect(data.data.ticket).toEqual(mockTicket);
    expect(data.data.token).toBeDefined();
    expect(prisma.player.create).toHaveBeenCalledWith({
      data: { gameId, name: "Alice" },
    });
    expect(pusherServer.trigger).toHaveBeenCalledWith(
      `game-${gameId}`,
      "player:joined",
      expect.objectContaining({
        player: expect.objectContaining({ name: "Alice" }),
      })
    );
    expect(prisma.game.update).toHaveBeenCalledWith({
      where: { id: gameId },
      data: { status: "LOBBY" },
    });
  });

  it("should return 404 if game not found", async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/join", {
      method: "POST",
      body: JSON.stringify({ name: "Alice" }),
    });

    const res = await POST(req, { params });
    expect(res.status).toBe(404);
  });

  it("should return 400 if game is full", async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: gameId,
      title: "Test Game",
      hostId: "host-123",
      status: "CONFIGURING",
      gameCode: "ABC123",
      numberInterval: 10,
      minPlayers: 2,
      maxPlayers: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      players: [{} as Player, {} as Player], // 2 players already
    } as Game & { players: Player[] });

    const req = new NextRequest("http://localhost/api/join", {
      method: "POST",
      body: JSON.stringify({ name: "Alice" }),
    });

    const res = await POST(req, { params });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Game is full");
  });

  it("should return 400 if game is completed", async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: gameId,
      title: "Test Game",
      hostId: "host-123",
      status: "COMPLETED",
      gameCode: "ABC123",
      numberInterval: 10,
      minPlayers: 2,
      maxPlayers: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      players: [],
    } as Game & { players: Player[] });

    const req = new NextRequest("http://localhost/api/join", {
      method: "POST",
      body: JSON.stringify({ name: "Alice" }),
    });

    const res = await POST(req, { params });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Game has already ended");
  });

  it("should allow duplicate names but return different player IDs (Idempotency check)", async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: gameId,
      title: "Test Game",
      hostId: "host-123",
      status: "CONFIGURING",
      gameCode: "ABC123",
      numberInterval: 10,
      minPlayers: 2,
      maxPlayers: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      players: [{ id: "p-existing", name: "Alice" } as Player], // Alice already exists
    } as Game & { players: Player[] });

    const mockPlayer = {
      id: "p-new",
      name: "Alice",
      joinedAt: new Date(),
    };
    const mockTicket = { id: "t-new", grid: [[1]] };

    vi.mocked(prisma.player.create).mockResolvedValue(
      mockPlayer as Player
    );
    vi.mocked(prisma.ticket.create).mockResolvedValue(
      mockTicket as Ticket
    );

    const req = new NextRequest("http://localhost/api/join", {
      method: "POST",
      body: JSON.stringify({ name: "Alice" }),
    });

    const res = await POST(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.player.id).toBe("p-new"); // New player created
    expect(data.data.player.name).toBe("Alice");
    expect(data.data.ticket.id).toBe("t-new");
    expect(data.data.token).toBeDefined();
  });
});
