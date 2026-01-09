export interface NumberCalledEvent {
  number: number;
  sequence: number;
  timestamp: string;
  remaining: number;
}

export type GameEndReason =
  | "ALL_NUMBERS_CALLED"
  | "FULL_HOUSE"
  | "FORCE_STOP";

export interface GameEndedEvent {
  reason: GameEndReason;
  finalSequence?: number;
  completedAt: string;
  winner?: {
    playerId: string;
    playerName: string;
    points: number;
  };
}

import type { GameDetails } from "@/features/game/game-store";

export interface PlayPageClientProps {
  gameId: string;
  gameTitle: string;
  numberInterval?: number;
  initialCalledNumbers?: number[];
  isHost?: boolean;
  gameData: GameDetails;
}
