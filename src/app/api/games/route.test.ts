import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockReturnValue(new Headers()),
}));

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
      findMany: vi.fn(),
    },
  },
}));

describe("GET /api/games", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/games");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should return 200 and games list if authenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: {
        id: "user1",
        email: "test@example.com",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: "Test User",
        image: null,
      },
      session: {
        id: "session1",
        userId: "user1",
        expiresAt: new Date(),
        token: "token",
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
      },
    });

    const mockGames = [
      {
        id: "1",
        title: "Game 1",
        status: "CONFIGURING",
        createdAt: new Date().toISOString(),
      },
    ];
    vi.mocked(prisma.game.findMany).mockResolvedValue(
      mockGames as any
    );

    const req = new NextRequest("http://localhost/api/games");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
    expect(data.data[0].title).toBe("Game 1");
    expect(prisma.game.findMany).toHaveBeenCalledWith({
      where: { hostId: "user1" },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        minPlayers: true,
        maxPlayers: true,
        gameCode: true,
      },
      orderBy: { createdAt: "desc" },
    });
  });
});
