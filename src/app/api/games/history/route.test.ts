import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { GameStatus } from "@/generated/prisma/client";

// Mock dependencies
vi.mock("@/lib/prisma", () => {
  const mockPrisma = {
    game: {
      findMany: vi.fn(),
    },
  };
  return { default: mockPrisma };
});

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

// Helper to create mock session
function createMockSession(userId: string) {
  return {
    user: {
      id: userId,
      name: "Test User",
      email: "test@test.com",
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: true,
    },
    session: {
      id: "session-1",
      userId,
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      token: "mock-token",
    },
  };
}

// Helper to create mock game for history
function createMockHistoryGame(overrides: Record<string, unknown>) {
  return {
    id: "game-1",
    title: "Test Game",
    hostId: "host-123",
    status: GameStatus.COMPLETED,
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    gameCode: "ABC123",
    numberInterval: 10,
    minPlayers: 2,
    maxPlayers: 75,
    calledNumbers: [],
    currentSequence: 90,
    startedAt: new Date(),
    host: { name: "Host User" },
    players: [],
    _count: { players: 5 },
    ...overrides,
  };
}

describe("GET /api/games/history", () => {
  const userId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return empty array when user has no game history", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(
      createMockSession(userId)
    );
    vi.mocked(prisma.game.findMany).mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toEqual([]);
  });

  it("should return games where user is host", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(
      createMockSession(userId)
    );

    vi.mocked(prisma.game.findMany).mockResolvedValue([
      createMockHistoryGame({
        id: "game-1",
        title: "My Game",
        hostId: userId,
        host: { name: "Test User" },
        players: [], // User was host only, not a player
      }),
    ]);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
    expect(data.data[0]).toMatchObject({
      id: "game-1",
      title: "My Game",
      hostName: "Test User",
      isHost: true,
      status: "host-only",
      totalPoints: 0,
      claims: [],
    });
  });

  it("should return games where user won prizes", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(
      createMockSession(userId)
    );

    vi.mocked(prisma.game.findMany).mockResolvedValue([
      createMockHistoryGame({
        id: "game-2",
        title: "Won Game",
        hostId: "other-host",
        host: { name: "Other Host" },
        players: [
          {
            id: "player-1",
            userId,
            name: "Test User",
            token: "token-1",
            gameId: "game-2",
            socketId: null,
            joinedAt: new Date(),
            claims: [
              {
                id: "claim-1",
                gameId: "game-2",
                playerId: "player-1",
                pattern: "FIRST_ROW",
                rank: 1,
                points: 50,
                claimedAt: new Date(),
              },
              {
                id: "claim-2",
                gameId: "game-2",
                playerId: "player-1",
                pattern: "FULL_HOUSE",
                rank: 1,
                points: 100,
                claimedAt: new Date(),
              },
            ],
          },
        ],
        _count: { players: 10 },
      }),
    ]);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
    expect(data.data[0]).toMatchObject({
      id: "game-2",
      title: "Won Game",
      hostName: "Other Host",
      isHost: false,
      status: "won",
      totalPoints: 150,
    });
    expect(data.data[0].claims).toHaveLength(2);
  });

  it("should return games where user participated but did not win", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(
      createMockSession(userId)
    );

    vi.mocked(prisma.game.findMany).mockResolvedValue([
      createMockHistoryGame({
        id: "game-3",
        title: "Participated Game",
        hostId: "other-host",
        host: { name: "Other Host" },
        players: [
          {
            id: "player-1",
            userId,
            name: "Test User",
            token: "token-1",
            gameId: "game-3",
            socketId: null,
            joinedAt: new Date(),
            claims: [], // No claims
          },
        ],
        _count: { players: 8 },
      }),
    ]);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
    expect(data.data[0]).toMatchObject({
      id: "game-3",
      title: "Participated Game",
      hostName: "Other Host",
      isHost: false,
      status: "participated",
      totalPoints: 0,
      claims: [],
    });
  });

  it("should only return COMPLETED games", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(
      createMockSession(userId)
    );

    // Mock just returns empty since we're filtering in the query
    vi.mocked(prisma.game.findMany).mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);

    // Verify the query includes status: "COMPLETED" filter
    expect(prisma.game.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "COMPLETED",
        }),
      })
    );
  });

  it("should calculate total points correctly from multiple claims", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(
      createMockSession(userId)
    );

    vi.mocked(prisma.game.findMany).mockResolvedValue([
      createMockHistoryGame({
        id: "game-4",
        title: "Multi-win Game",
        hostId: "other-host",
        host: { name: "Other Host" },
        players: [
          {
            id: "player-1",
            userId,
            name: "Test User",
            token: "token-1",
            gameId: "game-4",
            socketId: null,
            joinedAt: new Date(),
            claims: [
              {
                id: "claim-1",
                gameId: "game-4",
                playerId: "player-1",
                pattern: "EARLY_FIVE",
                rank: 1,
                points: 25,
                claimedAt: new Date(),
              },
              {
                id: "claim-2",
                gameId: "game-4",
                playerId: "player-1",
                pattern: "FIRST_ROW",
                rank: 2,
                points: 30,
                claimedAt: new Date(),
              },
              {
                id: "claim-3",
                gameId: "game-4",
                playerId: "player-1",
                pattern: "SECOND_ROW",
                rank: 1,
                points: 40,
                claimedAt: new Date(),
              },
            ],
          },
        ],
        _count: { players: 6 },
      }),
    ]);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data[0].totalPoints).toBe(95); // 25 + 30 + 40
    expect(data.data[0].status).toBe("won");
  });
});
