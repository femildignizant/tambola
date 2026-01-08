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
