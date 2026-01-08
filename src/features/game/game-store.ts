import { create } from "zustand";

interface Player {
  id: string;
  name: string;
  joinedAt: string;
}

interface GameDetails {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  status: "CONFIGURING" | "LOBBY" | "STARTED" | "COMPLETED";
  gameCode: string;
  numberInterval: number;
  minPlayers: number;
  maxPlayers: number;
  patterns: Array<{
    pattern: string;
    enabled: boolean;
    points1st: number;
    points2nd: number | null;
    points3rd: number | null;
  }>;
}

interface CurrentPlayer {
  id: string;
  name: string;
  token: string;
  ticket: {
    id: string;
    grid: number[][];
  };
}

export interface GameStore {
  // State
  game: GameDetails | null;
  players: Player[];
  currentPlayer: CurrentPlayer | null;
  isLoading: boolean;
  error: string | null;

  // Game Loop State (Story 4.1)
  calledNumbers: number[];
  currentNumber: number | null;
  gameSequence: number;
  isGameEnded: boolean;

  // Ticket State (Story 4.3)
  markedNumbers: number[];

  // Actions
  setGame: (game: GameDetails) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  setCurrentPlayer: (player: CurrentPlayer) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateGameStatus: (status: GameDetails["status"]) => void;
  reset: () => void;

  // Game Loop Actions (Story 4.1)
  setCalledNumbers: (numbers: number[]) => void;
  addCalledNumber: (number: number, sequence: number) => void;
  setGameEnded: () => void;
  resetGameLoopState: () => void;

  // Claim State (Story 5.2)
  isClaiming: boolean;
  claimError: string | null;
  claimedPatterns: ClaimedPattern[];

  // Claim Actions (Story 5.2)
  setIsClaiming: (isClaiming: boolean) => void;
  setClaimError: (error: string | null) => void;
  addClaimedPattern: (pattern: ClaimedPattern) => void;
  setClaimedPatterns: (patterns: ClaimedPattern[]) => void;
  resetClaimState: () => void;
  toggleMark: (number: number) => void;
  setMarkedNumbers: (numbers: number[]) => void;
}

interface ClaimedPattern {
  pattern: string;
  rank: number;
  points: number;
  playerId: string;
  playerName: string;
  claimedAt: string;
}

const initialState = {
  game: null,
  players: [],
  currentPlayer: null,
  isLoading: false,
  error: null,
  // Game Loop initial state
  calledNumbers: [],
  currentNumber: null,
  gameSequence: 0,
  isGameEnded: false,
  // Claim state (Story 5.2)
  isClaiming: false,
  claimError: null as string | null,
  claimedPatterns: [] as ClaimedPattern[],
  markedNumbers: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setGame: (game) => {
    console.log("🏪 Store setGame called with:", game);
    set({ game });
  },

  setPlayers: (players) => set({ players }),

  addPlayer: (player) =>
    set((state) => {
      // Check if player already exists
      const exists = state.players.some((p) => p.id === player.id);
      if (exists) {
        return state; // No change if player already exists
      }
      return {
        players: [...state.players, player],
      };
    }),

  setCurrentPlayer: (player) => set({ currentPlayer: player }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  updateGameStatus: (status) =>
    set((state) => ({
      game: state.game ? { ...state.game, status } : null,
    })),

  reset: () => set(initialState),

  // Game Loop Actions (Story 4.1)
  setCalledNumbers: (numbers) =>
    set({
      calledNumbers: numbers,
      currentNumber:
        numbers.length > 0 ? numbers[numbers.length - 1] : null,
      gameSequence: numbers.length,
    }),

  addCalledNumber: (number, sequence) =>
    set((state) => ({
      calledNumbers: [...state.calledNumbers, number],
      currentNumber: number,
      gameSequence: sequence,
    })),

  setGameEnded: () =>
    set((state) => ({
      isGameEnded: true,
      game: state.game
        ? { ...state.game, status: "COMPLETED" }
        : null,
    })),

  resetGameLoopState: () =>
    set({
      calledNumbers: [],
      currentNumber: null,
      gameSequence: 0,
      isGameEnded: false,
    }),

  // Ticket Actions (Story 4.3)
  toggleMark: async (number: number) => {
    const state = get();
    const isMarked = state.markedNumbers.includes(number);
    const newMarkedNumbers = isMarked
      ? state.markedNumbers.filter((n) => n !== number)
      : [...state.markedNumbers, number];

    // Optimistic update
    set({ markedNumbers: newMarkedNumbers });

    // API Call
    try {
      const gameId = state.game?.id;
      const token = state.currentPlayer?.token;
      if (!gameId || !token) return;

      const response = await fetch(
        `/api/games/${gameId}/ticket/mark`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            number,
            action: isMarked ? "UNMARK" : "MARK",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to sync mark");
      }
    } catch (error) {
      console.error("Mark sync failed:", error);
      // Revert on error
      set({ markedNumbers: state.markedNumbers });
    }
  },

  setMarkedNumbers: (numbers: number[]) =>
    set({ markedNumbers: numbers }),

  // Claim Actions (Story 5.2)
  setIsClaiming: (isClaiming) => set({ isClaiming }),

  setClaimError: (claimError) => set({ claimError }),

  addClaimedPattern: (pattern) =>
    set((state) => ({
      claimedPatterns: [...state.claimedPatterns, pattern],
    })),

  setClaimedPatterns: (claimedPatterns) => set({ claimedPatterns }),

  resetClaimState: () =>
    set({
      isClaiming: false,
      claimError: null,
      claimedPatterns: [], // Reset claimed patterns to prevent stale data
    }),
}));
