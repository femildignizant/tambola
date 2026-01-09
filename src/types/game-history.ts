import type { Pattern } from "@/generated/prisma/client";

/**
 * Shared types for Game History feature
 * Used by: API route, GameHistoryList, GameHistoryCard
 */

export interface GameHistoryClaim {
  pattern: Pattern;
  rank: number;
  points: number;
}

export interface GameHistoryItem {
  id: string;
  title: string;
  hostName: string;
  isHost: boolean;
  completedAt: string | null;
  playerCount: number;
  status: "won" | "participated" | "host-only";
  totalPoints: number;
  claims: GameHistoryClaim[];
}
