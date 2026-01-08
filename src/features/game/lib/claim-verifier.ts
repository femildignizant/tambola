import type { Ticket } from "../types";
import { ClaimPattern, type ClaimResult } from "../types/claims";

// Helper to filter valid numbers (non-null) from a row or array
function getValidNumbers(numbers: (number | null)[]): number[] {
  return numbers.filter((n): n is number => n !== null);
}

export function areAllNumbersCalled(
  targetNumbers: number[],
  calledNumbers: number[]
): boolean {
  if (targetNumbers.length === 0) return false;
  const calledSet = new Set(calledNumbers);
  return targetNumbers.every((num) => calledSet.has(num));
}

// Helper to find visual corners
function getRowCornerNumbers(row: (number | null)[]): number[] {
  const valid = getValidNumbers(row);
  if (valid.length === 0) return [];
  if (valid.length === 1) return [valid[0], valid[0]]; // Or invalid? Usually standard ticket has 5 nums per row.
  return [valid[0], valid[valid.length - 1]];
}

export function getNumbersForPattern(
  ticket: Ticket,
  pattern: ClaimPattern
): number[] {
  // Runtime safety: ensure ticket is a valid array of 3 rows
  if (!Array.isArray(ticket) || ticket.length !== 3) {
    return [];
  }

  switch (pattern) {
    case ClaimPattern.TOP_ROW:
      return getValidNumbers(ticket[0]);

    case ClaimPattern.MIDDLE_ROW:
      return getValidNumbers(ticket[1]);

    case ClaimPattern.BOTTOM_ROW:
      return getValidNumbers(ticket[2]);

    case ClaimPattern.FULL_HOUSE:
      return ticket.flatMap(getValidNumbers);

    case ClaimPattern.FOUR_CORNERS: {
      const topCorners = getRowCornerNumbers(ticket[0]); // Row 0
      const bottomCorners = getRowCornerNumbers(ticket[2]); // Row 2
      // Standard Tambola: 4 corners total.
      return [...topCorners, ...bottomCorners];
    }

    // EARLY_FIVE needs special handling in checkPattern as it's "any 5"
    case ClaimPattern.EARLY_FIVE:
      return ticket.flatMap(getValidNumbers);

    default:
      return [];
  }
}

export function checkPattern(
  ticket: Ticket,
  calledNumbers: number[],
  pattern: ClaimPattern
): ClaimResult {
  const calledSet = new Set(calledNumbers);

  // Guard: Empty called numbers cannot satisfy any claim
  if (calledNumbers.length === 0) {
    return { isValid: false, reason: "No numbers called yet" };
  }

  // Special logic for EARLY_FIVE
  if (pattern === ClaimPattern.EARLY_FIVE) {
    const allTicketNumbers = ticket.flatMap(getValidNumbers);
    const matchedCount = allTicketNumbers.reduce(
      (count: number, num: number) =>
        calledSet.has(num) ? count + 1 : count,
      0
    );

    if (matchedCount >= 5) {
      const verifiedNumbers = allTicketNumbers
        .filter((num) => calledSet.has(num))
        .slice(0, 5);
      return { isValid: true, verifiedNumbers };
    }
    return {
      isValid: false,
      reason: `Found only ${matchedCount}/5 numbers`,
    };
  }

  // Geometric patterns
  const targetNumbers = getNumbersForPattern(ticket, pattern);

  if (targetNumbers.length === 0) {
    return {
      isValid: false,
      reason: "Pattern has no target numbers on this ticket",
    };
  }

  const allCalled = targetNumbers.every((num) => calledSet.has(num));

  if (allCalled) {
    return { isValid: true, verifiedNumbers: targetNumbers };
  }

  return {
    isValid: false,
    reason: `Missing numbers for ${pattern}`,
  };
}
