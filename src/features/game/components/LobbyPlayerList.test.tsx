import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGameStore } from "../game-store";
import { LobbyPlayerList } from "./LobbyPlayerList";

// Mock game store
vi.mock("../game-store", () => ({
	useGameStore: vi.fn(),
}));

// Mock UI components
vi.mock("@/components/ui/card", () => ({
	Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	CardTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
	CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/badge", () => ({
	Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));
vi.mock("lucide-react", () => ({
	Users: () => <svg data-testid="users-icon" />,
}));

describe("LobbyPlayerList", () => {
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

	it("should render player list with players from store", () => {
		vi.mocked(useGameStore).mockReturnValue({
			players: mockPlayers,
		} as ReturnType<typeof useGameStore>);

		render(<LobbyPlayerList maxPlayers={10} />);

		expect(screen.getByText("Players")).toBeDefined();
		expect(screen.getByText("2 / 10")).toBeDefined();
	});

	it("should show empty state when no players", () => {
		vi.mocked(useGameStore).mockReturnValue({
			players: [],
		} as ReturnType<typeof useGameStore>);

		render(<LobbyPlayerList maxPlayers={10} />);

		expect(screen.getByText("Waiting for players to join...")).toBeDefined();
	});

	it("should highlight current player", () => {
		vi.mocked(useGameStore).mockReturnValue({
			players: mockPlayers,
		} as ReturnType<typeof useGameStore>);

		const { container } = render(
			<LobbyPlayerList maxPlayers={10} currentPlayerId="player-1" />,
		);

		expect(screen.getByText("You")).toBeDefined();

		// Check that the current player's container has the highlight class
		const playerItems = container.querySelectorAll("li");
		const currentPlayerItem = Array.from(playerItems).find((item) =>
			item.textContent?.includes("Player One"),
		);
		// Updated to match actual implementation: border-foreground (not border-primary)
		expect(currentPlayerItem?.className).toContain("border-foreground");
	});

	it("should display player names from store", () => {
		vi.mocked(useGameStore).mockReturnValue({
			players: mockPlayers,
		} as ReturnType<typeof useGameStore>);

		render(<LobbyPlayerList maxPlayers={10} />);

		expect(screen.getByText("Player One")).toBeDefined();
		expect(screen.getByText("Player Two")).toBeDefined();
	});

	it("should format join time correctly", () => {
		vi.mocked(useGameStore).mockReturnValue({
			players: mockPlayers,
		} as ReturnType<typeof useGameStore>);

		render(<LobbyPlayerList maxPlayers={10} />);

		// The time should be formatted as HH:MM
		// We can't test exact time due to timezone differences, but we can check format
		const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
		expect(timeElements.length).toBeGreaterThan(0);
	});
});
