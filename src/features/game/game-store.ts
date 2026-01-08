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

interface GameStore {
  // State
  game: GameDetails | null;
  players: Player[];
  currentPlayer: CurrentPlayer | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setGame: (game: GameDetails) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  setCurrentPlayer: (player: CurrentPlayer) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateGameStatus: (status: GameDetails["status"]) => void;
  reset: () => void;
}

const initialState = {
  game: null,
  players: [],
  currentPlayer: null,
  isLoading: false,
  error: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setGame: (game) => set({ game }),

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
}));
