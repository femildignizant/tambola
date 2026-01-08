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
