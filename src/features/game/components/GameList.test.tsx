import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { GameList } from "./GameList";

// Mock the Badge and Skeleton components since they are UI components
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));
vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));
vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("GameList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should render loading state initially", () => {
    render(<GameList />);
    expect(screen.getAllByTestId("skeleton")).toHaveLength(3);
  });

  it("should render error state on fetch failure", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(
      new Error("Network error")
    );
    render(<GameList />);

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred loading games")
      ).toBeDefined();
    });
  });

  it("should render empty state when no games found", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    render(<GameList />);

    await waitFor(() => {
      expect(screen.getByText("No games found")).toBeDefined();
      expect(screen.getByText("Create New Game")).toBeDefined();
    });
  });

  it("should render games list when games are returned", async () => {
    const mockGames = [
      {
        id: "1",
        title: "Test Game",
        status: "CONFIGURING",
        createdAt: new Date().toISOString(),
        gameCode: "CODE12",
        minPlayers: 2,
        maxPlayers: 10,
      },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockGames }),
    } as Response);

    render(<GameList />);

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeDefined();
      expect(screen.getByText("CODE12")).toBeDefined();
      expect(screen.getByText("CONFIGURING")).toBeDefined();
    });
  });
});
