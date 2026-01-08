import { describe, it, expect } from "vitest";
import { checkPattern } from "./claim-verifier";
import { ClaimPattern } from "../types/claims";
import type { Ticket } from "../types";

// Mock ticket helper
const createMockTicket = (numbers: (number | null)[][]): Ticket => {
  return numbers as Ticket;
};

// Standard ticket structure: 3 rows, 9 cols
// Row 1: [1, null, 20, null, 40, null, 60, null, 80] -> 1, 20, 40, 60, 80
// Row 2: [null, 15, null, 35, null, 55, null, 75, null] -> 15, 35, 55, 75
// Note: Row 2 usually has 5 numbers too. Let's make a valid ticket.
// Row 2: [null, 15, 25, 35, 45, null, null, null, 90] -> 15, 25, 35, 45, 90
// Row 3: [5, null, null, 38, null, 58, 68, 78, null] -> 5, 38, 58, 68, 78

const MOCK_TICKET_GRID: (number | null)[][] = [
  [1, null, 20, null, 40, null, 60, null, 80],
  [null, 15, 25, 35, 45, null, null, null, 90],
  [5, null, null, 38, null, 58, 68, 78, null],
];

const mockTicket = createMockTicket(MOCK_TICKET_GRID);

// Extract numbers for readability in tests
const ROW_1_NUMS = [1, 20, 40, 60, 80];
const ROW_2_NUMS = [15, 25, 35, 45, 90];
const ROW_3_NUMS = [5, 38, 58, 68, 78];
const CORNER_NUMS = [1, 80, 5, 78]; // First/Last of Top/Bottom
const ALL_NUMS = [...ROW_1_NUMS, ...ROW_2_NUMS, ...ROW_3_NUMS];

describe("Claim Verifier Logic", () => {
  describe("checkPattern", () => {
    it("should reject claims with empty called numbers", () => {
      const result = checkPattern(
        mockTicket,
        [],
        ClaimPattern.EARLY_FIVE
      );
      expect(result.isValid).toBe(false);
    });

    describe("EARLY_FIVE", () => {
      it("should be valid when any 5 numbers on ticket are called", () => {
        const called = [1, 20, 15, 25, 5]; // 5 numbers from the ticket
        const result = checkPattern(
          mockTicket,
          called,
          ClaimPattern.EARLY_FIVE
        );
        expect(result.isValid).toBe(true);
      });

      it("should be invalid when fewer than 5 numbers are called", () => {
        const called = [1, 20, 15, 25]; // Only 4 numbers
        const result = checkPattern(
          mockTicket,
          called,
          ClaimPattern.EARLY_FIVE
        );
        expect(result.isValid).toBe(false);
      });
    });

    describe("Rows", () => {
      it("should validate TOP_ROW correctly", () => {
        const result = checkPattern(
          mockTicket,
          ROW_1_NUMS,
          ClaimPattern.TOP_ROW
        );
        expect(result.isValid).toBe(true);
      });

      it("should fail TOP_ROW if one number missing", () => {
        const called = ROW_1_NUMS.slice(0, 4);
        const result = checkPattern(
          mockTicket,
          called,
          ClaimPattern.TOP_ROW
        );
        expect(result.isValid).toBe(false);
      });

      it("should validate MIDDLE_ROW correctly", () => {
        const result = checkPattern(
          mockTicket,
          ROW_2_NUMS,
          ClaimPattern.MIDDLE_ROW
        );
        expect(result.isValid).toBe(true);
      });

      it("should validate BOTTOM_ROW correctly", () => {
        const result = checkPattern(
          mockTicket,
          ROW_3_NUMS,
          ClaimPattern.BOTTOM_ROW
        );
        expect(result.isValid).toBe(true);
      });
    });

    describe("FOUR_CORNERS", () => {
      it("should validate FOUR_CORNERS correctly", () => {
        const result = checkPattern(
          mockTicket,
          CORNER_NUMS,
          ClaimPattern.FOUR_CORNERS
        );
        expect(result.isValid).toBe(true);
      });

      it("should fail FOUR_CORNERS if one missing", () => {
        const called = CORNER_NUMS.slice(0, 3);
        const result = checkPattern(
          mockTicket,
          called,
          ClaimPattern.FOUR_CORNERS
        );
        expect(result.isValid).toBe(false);
      });

      // Edge case: "Visual" corners.
      // If a row starts with null, the corner is the first *number*.
      // Our mock ticket handles this:
      // Row 1 starts with 1 (index 0). Ends with 80 (index 8).
      // Row 3 starts with 5 (index 0). Ends with null (index 8) -> wait, index 8 is null in my mock?
      // Let's re-verify mock ticket Row 3: [5, null, null, 38, null, 58, 68, 78, null]
      // Yes, index 8 is null. So the last number is 78 at index 7.
      // This tests that we truly look for the last *number*, not just index 8.
      it("should find the last actual number for bottom right corner even if last cell is null", () => {
        const result = checkPattern(
          mockTicket,
          CORNER_NUMS,
          ClaimPattern.FOUR_CORNERS
        );
        expect(result.isValid).toBe(true);
      });
    });

    describe("FULL_HOUSE", () => {
      it("should validate FULL_HOUSE when all numbers called", () => {
        const result = checkPattern(
          mockTicket,
          ALL_NUMS,
          ClaimPattern.FULL_HOUSE
        );
        expect(result.isValid).toBe(true);
      });

      it("should fail FULL_HOUSE if one number missing", () => {
        const called = ALL_NUMS.slice(0, 14);
        const result = checkPattern(
          mockTicket,
          called,
          ClaimPattern.FULL_HOUSE
        );
        expect(result.isValid).toBe(false);
      });
    });
  });
});
