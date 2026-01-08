import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LobbyPlayerList } from "./LobbyPlayerList";

// Mock Pusher client
const mockChannel = {
  bind: vi.fn(),
  unbind: vi.fn(),
};

const mockPusherClient = {
  subscribe: vi.fn(() => mockChannel),
  unsubscribe: vi.fn(),
};

vi.mock("@/lib/pusher-client", () => ({
  pusherClient: mockPusherClient,
}));

// Mock game store
const mockSetPlayers = vi.fn();
const mockAddPlayer = vi.fn();

vi.mock("../game-store", () => ({
  useGameStore: () => ({
    players: [],
    setPlayers: mockSetPlayers,
    addPlayer: mockAddPlayer,
  }),
}));

// Mock UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));
vi.mock("lucide-react", () => ({
  Users: () => <svg data-testid="users-icon" />,
}));

describe("LobbyPlayerList", () => {
  const mockGameId = "test-game-123";
  const mockPlayers = [
    {
      id: "player-1",
      name: "Player One",
      joinedAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "player-2",
      name: "Player Two",
      joinedAt: "2024-01-01T10:05:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render player list with initial players", () => {
    // Update mock to return initial players
    vi.mocked(vi.importActual("../game-store") as any).useGameStore =
      () => ({
        players: mockPlayers,
        setPlayers: mockSetPlayers,
        addPlayer: mockAddPlayer,
      });

    render(
      <LobbyPlayerList
        gameId={mockGameId}
        initialPlayers={mockPlayers}
        maxPlayers={10}
      />
    );

    expect(screen.getByText("Players")).toBeDefined();
    expect(screen.getByText("2 / 10")).toBeDefined();
  });

  it("should subscribe to Pusher channel on mount", () => {
    render(
      <LobbyPlayerList
        gameId={mockGameId}
        initialPlayers={[]}
        maxPlayers={10}
      />
    );

    expect(mockPusherClient.subscribe).toHaveBeenCalledWith(
      `game-${mockGameId}`
    );
    expect(mockChannel.bind).toHaveBeenCalledWith(
      "player:joined",
      expect.any(Function)
    );
  });

  it("should unsubscribe from Pusher channel on unmount", () => {
    const { unmount } = render(
      <LobbyPlayerList
        gameId={mockGameId}
        initialPlayers={[]}
        maxPlayers={10}
      />
    );

    unmount();

    expect(mockChannel.unbind).toHaveBeenCalledWith("player:joined");
    expect(mockPusherClient.unsubscribe).toHaveBeenCalledWith(
      `game-${mockGameId}`
    );
  });

  it("should show empty state when no players", () => {
    render(
      <LobbyPlayerList
        gameId={mockGameId}
        initialPlayers={[]}
        maxPlayers={10}
      />
    );

    expect(
      screen.getByText("Waiting for players to join...")
    ).toBeDefined();
  });

  it("should highlight current player", () => {
    vi.mocked(vi.importActual("../game-store") as any).useGameStore =
      () => ({
        players: mockPlayers,
        setPlayers: mockSetPlayers,
        addPlayer: mockAddPlayer,
      });

    const { container } = render(
      <LobbyPlayerList
        gameId={mockGameId}
        initialPlayers={mockPlayers}
        maxPlayers={10}
        currentPlayerId="player-1"
      />
    );

    expect(screen.getByText("You")).toBeDefined();

    // Check that the current player's container has the highlight class
    const playerItems = container.querySelectorAll("li");
    const currentPlayerItem = Array.from(playerItems).find((item) =>
      item.textContent?.includes("Player One")
    );
    expect(currentPlayerItem?.className).toContain("border-primary");
  });

  it("should call setPlayers with initial players on mount", () => {
    render(
      <LobbyPlayerList
        gameId={mockGameId}
        initialPlayers={mockPlayers}
        maxPlayers={10}
      />
    );

    expect(mockSetPlayers).toHaveBeenCalledWith(mockPlayers);
  });

  it("should format join time correctly", () => {
    vi.mocked(vi.importActual("../game-store") as any).useGameStore =
      () => ({
        players: mockPlayers,
        setPlayers: mockSetPlayers,
        addPlayer: mockAddPlayer,
      });

    render(
      <LobbyPlayerList
        gameId={mockGameId}
        initialPlayers={mockPlayers}
        maxPlayers={10}
      />
    );

    // The time should be formatted as HH:MM
    // We can't test exact time due to timezone differences, but we can check format
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });
});
