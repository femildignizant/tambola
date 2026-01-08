export enum ClaimPattern {
  EARLY_FIVE = "EARLY_FIVE",
  TOP_ROW = "TOP_ROW",
  MIDDLE_ROW = "MIDDLE_ROW",
  BOTTOM_ROW = "BOTTOM_ROW",
  FOUR_CORNERS = "FOUR_CORNERS",
  FULL_HOUSE = "FULL_HOUSE",
}

export interface ClaimResult {
  isValid: boolean;
  reason?: string;
  verifiedNumbers?: number[];
}

// Prisma Pattern enum values (must match schema.prisma)
export type DbPattern =
  | "FIRST_ROW"
  | "SECOND_ROW"
  | "THIRD_ROW"
  | "EARLY_FIVE"
  | "FOUR_CORNERS"
  | "FULL_HOUSE";

// Centralized mapping from frontend ClaimPattern to DB Pattern
// Used by both API and UI components to avoid duplicate code
export const CLAIM_PATTERN_TO_DB_PATTERN: Record<
  ClaimPattern,
  DbPattern
> = {
  [ClaimPattern.EARLY_FIVE]: "EARLY_FIVE",
  [ClaimPattern.TOP_ROW]: "FIRST_ROW",
  [ClaimPattern.MIDDLE_ROW]: "SECOND_ROW",
  [ClaimPattern.BOTTOM_ROW]: "THIRD_ROW",
  [ClaimPattern.FOUR_CORNERS]: "FOUR_CORNERS",
  [ClaimPattern.FULL_HOUSE]: "FULL_HOUSE",
};

// Display info for UI components
export const PATTERN_DISPLAY_INFO: Record<
  ClaimPattern,
  { name: string; description: string }
> = {
  [ClaimPattern.EARLY_FIVE]: {
    name: "Early Five",
    description: "Any 5 numbers on your ticket",
  },
  [ClaimPattern.TOP_ROW]: {
    name: "Top Row",
    description: "All 5 numbers in the first row",
  },
  [ClaimPattern.MIDDLE_ROW]: {
    name: "Middle Row",
    description: "All 5 numbers in the middle row",
  },
  [ClaimPattern.BOTTOM_ROW]: {
    name: "Bottom Row",
    description: "All 5 numbers in the bottom row",
  },
  [ClaimPattern.FOUR_CORNERS]: {
    name: "Four Corners",
    description: "First and last numbers of top and bottom rows",
  },
  [ClaimPattern.FULL_HOUSE]: {
    name: "Full House",
    description: "All 15 numbers on your ticket",
  },
};

// Redis lock TTL in seconds for claim locking
export const CLAIM_LOCK_TTL_SECONDS = 30;
