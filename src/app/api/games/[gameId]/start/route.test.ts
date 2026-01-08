import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    game: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/pusher-server", () => ({
  pusherServer: {
    trigger: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockFindUnique = vi.mocked(prisma.game.findUnique);
const mockUpdate = vi.mocked(prisma.game.update);
const mockPusherTrigger = vi.mocked(pusherServer.trigger);

describe("POST /api/games/[gameId]/start", () => {
  const mockGameId = "game-123";
  const mockHostId = "host-user-123";
  const mockOtherUserId = "other-user-456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = () => {
    return new NextRequest(
      "http://localhost:3000/api/games/game-123/start",
      {
        method: "POST",
      }
    );
  };

  const createParams = (gameId: string = mockGameId) => ({
    params: Promise.resolve({ gameId }),
  });

  it("should return 401 if user is not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 if game is not found", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: mockHostId },
      session: { token: "token", expiresAt: new Date() },
    });
    mockFindUnique.mockResolvedValue(null);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Game not found");
  });

  it("should return 403 if user is not the host", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: mockOtherUserId },
      session: { token: "token", expiresAt: new Date() },
    });
    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      hostId: mockHostId,
      status: "LOBBY",
      minPlayers: 2,
      _count: { players: 3 },
    } as never);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Only the host can start the game");
    expect(data.code).toBe("UNAUTHORIZED");
  });

  it("should return 400 if game has already started", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: mockHostId },
      session: { token: "token", expiresAt: new Date() },
    });
    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      hostId: mockHostId,
      status: "STARTED",
      minPlayers: 2,
      _count: { players: 3 },
    } as never);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Game has already started");
    expect(data.code).toBe("GAME_ALREADY_STARTED");
  });

  it("should return 400 if game is in CONFIGURING status", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: mockHostId },
      session: { token: "token", expiresAt: new Date() },
    });
    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      hostId: mockHostId,
      status: "CONFIGURING",
      minPlayers: 2,
      _count: { players: 3 },
    } as never);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Game must be in lobby status to start");
    expect(data.code).toBe("INVALID_GAME_STATUS");
  });

  it("should return 400 if minimum players not met", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: mockHostId },
      session: { token: "token", expiresAt: new Date() },
    });
    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      hostId: mockHostId,
      status: "LOBBY",
      minPlayers: 5,
      _count: { players: 2 },
    } as never);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(
      "Minimum 5 players required. Currently 2 joined."
    );
    expect(data.code).toBe("MIN_PLAYERS_NOT_MET");
  });

  it("should start game successfully when host and minimum players met", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: mockHostId },
      session: { token: "token", expiresAt: new Date() },
    });
    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      hostId: mockHostId,
      status: "LOBBY",
      minPlayers: 2,
      _count: { players: 5 },
    } as never);
    mockUpdate.mockResolvedValue({
      id: mockGameId,
      status: "STARTED",
    } as never);
    mockPusherTrigger.mockResolvedValue(undefined as never);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.gameId).toBe(mockGameId);
    expect(data.data.status).toBe("STARTED");
    expect(data.data.startedAt).toBeDefined();

    // Verify game was updated
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: mockGameId },
      data: { status: "STARTED" },
    });

    // Verify Pusher event was triggered
    expect(mockPusherTrigger).toHaveBeenCalledWith(
      `game-${mockGameId}`,
      "game:started",
      expect.objectContaining({
        gameId: mockGameId,
        startedAt: expect.any(String),
      })
    );
  });

  it("should start game when exactly minimum players joined", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: mockHostId },
      session: { token: "token", expiresAt: new Date() },
    });
    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      hostId: mockHostId,
      status: "LOBBY",
      minPlayers: 2,
      _count: { players: 2 },
    } as never);
    mockUpdate.mockResolvedValue({
      id: mockGameId,
      status: "STARTED",
    } as never);

    const response = await POST(createRequest(), createParams());

    expect(response.status).toBe(200);
  });
});
