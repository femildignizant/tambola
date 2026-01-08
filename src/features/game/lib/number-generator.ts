import { randomInt } from "crypto";

const TOTAL_NUMBERS = 90;

/**
 * Get the next uncalled number for a game using cryptographically secure random selection.
 * @param calledNumbers Array of already called numbers
 * @returns Next number (1-90) or null if all numbers have been called
 */
export function getNextNumber(calledNumbers: number[]): number | null {
  if (calledNumbers.length >= TOTAL_NUMBERS) {
    return null; // All numbers called
  }

  // Build set of available numbers
  const calledSet = new Set(calledNumbers);
  const available: number[] = [];

  for (let i = 1; i <= TOTAL_NUMBERS; i++) {
    if (!calledSet.has(i)) {
      available.push(i);
    }
  }

  if (available.length === 0) {
    return null;
  }

  // Securely select random index using crypto.randomInt
  const randomIndex = randomInt(0, available.length);
  return available[randomIndex];
}

/**
 * Check if all numbers have been called (game is complete)
 * @param calledNumbers Array of called numbers
 * @returns true if all 90 numbers have been called
 */
export function isGameComplete(calledNumbers: number[]): boolean {
  return calledNumbers.length >= TOTAL_NUMBERS;
}

/**
 * Get the count of remaining numbers that haven't been called
 * @param calledNumbers Array of called numbers
 * @returns Number of remaining uncalled numbers
 */
export function getRemainingCount(calledNumbers: number[]): number {
  return Math.max(0, TOTAL_NUMBERS - calledNumbers.length);
}
