import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Game } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { POST } from "./route";

// Mock prisma
vi.mock("@/lib/prisma", () => {
  const mockPrisma = {
    game: {
      findFirst: vi.fn(),
    },
  };
  return { default: mockPrisma };
});

describe("POST /api/games/lookup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return gameId for valid code", async () => {
    vi.mocked(prisma.game.findFirst).mockResolvedValue({
      id: "game-123",
      title: "Test Game",
      hostId: "host-123",
      status: "LOBBY",
      gameCode: "ABC123",
      numberInterval: 10,
      minPlayers: 2,
      maxPlayers: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      calledNumbers: [],
      currentSequence: 0,
      startedAt: null,
      completedAt: null,
      _count: { players: 3 },
    } as Game & { _count: { players: number } });

    const req = new NextRequest("http://localhost/api/games/lookup", {
      method: "POST",
      body: JSON.stringify({ code: "ABC123" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.gameId).toBe("game-123");
    expect(data.data.title).toBe("Test Game");
    expect(data.data.status).toBe("LOBBY");
    expect(data.data.playerCount).toBe(3);
    expect(data.data.maxPlayers).toBe(10);
  });

  it("should return 404 for non-existent code", async () => {
    vi.mocked(prisma.game.findFirst).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/games/lookup", {
      method: "POST",
      body: JSON.stringify({ code: "XXXXXX" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe(
      "Game not found. Check your code and try again."
    );
  });

  it("should return 400 for started game", async () => {
    vi.mocked(prisma.game.findFirst).mockResolvedValue({
      id: "game-123",
      title: "Test Game",
      hostId: "host-123",
      status: "STARTED",
      gameCode: "ABC123",
      numberInterval: 10,
      minPlayers: 2,
      maxPlayers: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      calledNumbers: [1, 2, 3],
      currentSequence: 3,
      startedAt: new Date(),
      completedAt: null,
      _count: { players: 5 },
    } as Game & { _count: { players: number } });

    const req = new NextRequest("http://localhost/api/games/lookup", {
      method: "POST",
      body: JSON.stringify({ code: "ABC123" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe(
      "This game has already started. You cannot join now."
    );
  });

  it("should return 400 for full game", async () => {
    vi.mocked(prisma.game.findFirst).mockResolvedValue({
      id: "game-123",
      title: "Test Game",
      hostId: "host-123",
      status: "LOBBY",
      gameCode: "ABC123",
      numberInterval: 10,
      minPlayers: 2,
      maxPlayers: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      calledNumbers: [],
      currentSequence: 0,
      startedAt: null,
      completedAt: null,
      _count: { players: 5 },
    } as Game & { _count: { players: number } });

    const req = new NextRequest("http://localhost/api/games/lookup", {
      method: "POST",
      body: JSON.stringify({ code: "ABC123" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("This game is full.");
  });

  it("should return 400 for completed game", async () => {
    vi.mocked(prisma.game.findFirst).mockResolvedValue({
      id: "game-123",
      title: "Test Game",
      hostId: "host-123",
      status: "COMPLETED",
      gameCode: "ABC123",
      numberInterval: 10,
      minPlayers: 2,
      maxPlayers: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      calledNumbers: [1, 2, 3],
      currentSequence: 90,
      startedAt: new Date(),
      completedAt: new Date(),
      _count: { players: 5 },
    } as Game & { _count: { players: number } });

    const req = new NextRequest("http://localhost/api/games/lookup", {
      method: "POST",
      body: JSON.stringify({ code: "ABC123" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("This game has already ended.");
  });

  it("should return 400 for invalid code format (too short)", async () => {
    const req = new NextRequest("http://localhost/api/games/lookup", {
      method: "POST",
      body: JSON.stringify({ code: "ABC" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid code format");
  });

  it("should return 400 for invalid code format (non-alphanumeric)", async () => {
    const req = new NextRequest("http://localhost/api/games/lookup", {
      method: "POST",
      body: JSON.stringify({ code: "ABC-12" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid code format");
  });

  it("should handle case-insensitive lookup", async () => {
    vi.mocked(prisma.game.findFirst).mockResolvedValue({
      id: "game-123",
      title: "Test Game",
      hostId: "host-123",
      status: "LOBBY",
      gameCode: "ABC123",
      numberInterval: 10,
      minPlayers: 2,
      maxPlayers: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      calledNumbers: [],
      currentSequence: 0,
      startedAt: null,
      completedAt: null,
      _count: { players: 3 },
    } as Game & { _count: { players: number } });

    const req = new NextRequest("http://localhost/api/games/lookup", {
      method: "POST",
      body: JSON.stringify({ code: "abc123" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.gameId).toBe("game-123");
    expect(prisma.game.findFirst).toHaveBeenCalledWith({
      where: {
        gameCode: { equals: "abc123", mode: "insensitive" },
      },
      include: {
        _count: { select: { players: true } },
      },
    });
  });
});
