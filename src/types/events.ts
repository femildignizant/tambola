export interface NumberCalledEvent {
  number: number;
  sequence: number;
  timestamp: string;
  remaining: number;
}

export interface GameEndedEvent {
  reason: "ALL_NUMBERS_CALLED" | "FULL_HOUSE_CLAIMED";
  finalSequence: number;
  completedAt: string;
}

import { GameDetails } from "@/features/game/game-store";

export interface PlayPageClientProps {
  gameId: string;
  gameTitle: string;
  numberInterval?: number;
  initialCalledNumbers?: number[];
  isHost?: boolean;
  gameData: GameDetails;
}
