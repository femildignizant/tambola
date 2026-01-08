import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock dependencies
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

import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

const mockFindUnique = vi.mocked(prisma.game.findUnique);
const mockUpdate = vi.mocked(prisma.game.update);
const mockPusherTrigger = vi.mocked(pusherServer.trigger);

describe("POST /api/games/[gameId]/call-number", () => {
  const mockGameId = "game-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = () => {
    return new NextRequest(
      `http://localhost:3000/api/games/${mockGameId}/call-number`,
      {
        method: "POST",
      }
    );
  };

  const createParams = (gameId: string = mockGameId) => ({
    params: Promise.resolve({ gameId }),
  });

  it("should return 404 if game is not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Game not found");
  });

  it("should return 400 if game is not in STARTED status", async () => {
    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      status: "LOBBY",
      calledNumbers: [],
      currentSequence: 0,
      numberInterval: 10,
    } as never);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Game is not in progress");
    expect(data.code).toBe("GAME_NOT_STARTED");
  });

  it("should return 400 if game is in CONFIGURING status", async () => {
    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      status: "CONFIGURING",
      calledNumbers: [],
      currentSequence: 0,
      numberInterval: 10,
    } as never);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe("GAME_NOT_STARTED");
  });

  it("should call next number and return valid response", async () => {
    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      status: "STARTED",
      calledNumbers: [1, 5, 10],
      currentSequence: 3,
      numberInterval: 10,
    } as never);

    mockUpdate.mockResolvedValue({
      id: mockGameId,
      status: "STARTED",
      calledNumbers: [1, 5, 10, 42],
      currentSequence: 4,
    } as never);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.number).toBeGreaterThanOrEqual(1);
    expect(data.data.number).toBeLessThanOrEqual(90);
    expect([1, 5, 10]).not.toContain(data.data.number);
    expect(data.data.sequence).toBe(4);
    expect(data.data.remaining).toBe(86);
    expect(data.data.ended).toBe(false);
    expect(data.data.timestamp).toBeDefined();
  });

  it("should broadcast number:called event via Pusher", async () => {
    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      status: "STARTED",
      calledNumbers: [],
      currentSequence: 0,
      numberInterval: 10,
    } as never);

    mockUpdate.mockResolvedValue({
      id: mockGameId,
      status: "STARTED",
      calledNumbers: [42],
      currentSequence: 1,
    } as never);

    await POST(createRequest(), createParams());

    expect(mockPusherTrigger).toHaveBeenCalledWith(
      `game-${mockGameId}`,
      "number:called",
      expect.objectContaining({
        number: expect.any(Number),
        sequence: 1,
        timestamp: expect.any(String),
        remaining: 89,
      })
    );
  });

  it("should not return already called numbers", async () => {
    // Call all numbers except 42
    const calledNumbers = Array.from({ length: 89 }, (_, i) =>
      i + 1 === 42 ? 90 : i + 1
    ).filter((n) => n !== 42);

    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      status: "STARTED",
      calledNumbers,
      currentSequence: 89,
      numberInterval: 10,
    } as never);

    mockUpdate.mockResolvedValue({
      id: mockGameId,
      status: "STARTED",
    } as never);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    expect(data.data.number).toBe(42);
  });

  it("should end game when all 90 numbers are called", async () => {
    // 89 numbers called, next call will be the 90th
    const calledNumbers = Array.from({ length: 89 }, (_, i) => i + 1);

    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      status: "STARTED",
      calledNumbers,
      currentSequence: 89,
      numberInterval: 10,
    } as never);

    mockUpdate.mockResolvedValue({
      id: mockGameId,
      status: "COMPLETED",
    } as never);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.ended).toBe(true);
    expect(data.data.sequence).toBe(90);
    expect(data.data.remaining).toBe(0);

    // Verify game was updated to COMPLETED
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "COMPLETED",
          completedAt: expect.any(Date),
        }),
      })
    );
  });

  it("should broadcast game:ended event when game completes", async () => {
    const calledNumbers = Array.from({ length: 89 }, (_, i) => i + 1);

    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      status: "STARTED",
      calledNumbers,
      currentSequence: 89,
      numberInterval: 10,
    } as never);

    mockUpdate.mockResolvedValue({
      id: mockGameId,
      status: "COMPLETED",
    } as never);

    await POST(createRequest(), createParams());

    expect(mockPusherTrigger).toHaveBeenCalledWith(
      `game-${mockGameId}`,
      "game:ended",
      expect.objectContaining({
        reason: "ALL_NUMBERS_CALLED",
        finalSequence: 90,
        completedAt: expect.any(String),
      })
    );
  });

  it("should return ended=true when game is already complete", async () => {
    // All 90 numbers already called
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      status: "STARTED",
      calledNumbers: allNumbers,
      currentSequence: 90,
      numberInterval: 10,
    } as never);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.ended).toBe(true);
    expect(data.data.finalSequence).toBe(90);

    // Should not call update when game is already complete
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should update database with new called number", async () => {
    mockFindUnique.mockResolvedValue({
      id: mockGameId,
      status: "STARTED",
      calledNumbers: [5, 10, 15],
      currentSequence: 3,
      numberInterval: 10,
    } as never);

    mockUpdate.mockResolvedValue({
      id: mockGameId,
      status: "STARTED",
    } as never);

    const response = await POST(createRequest(), createParams());
    const data = await response.json();

    // Verify update was called with correct structure
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { 
        id: mockGameId,
        currentSequence: 3 
      },
      data: expect.objectContaining({
        calledNumbers: expect.arrayContaining([5, 10, 15, data.data.number]),
        currentSequence: 4,
      }),
    });
  });
});
