import type { Ticket, TicketCell } from "../types";
import { TICKET_COLUMN_RANGES, GAME_CONSTANTS } from "../types";

/**
 * Generates a standard 3x9 Tambola ticket.
 * Rules:
 * 1. 3 rows, 9 columns.
 * 2. Exactly 5 numbers per row (total 15 numbers).
 * 3. Each column has numbers from its specific range (1-9, 10-19, etc.).
 * 4. Each column must have at least 1 number.
 * 5. Numbers in a column must be sorted ascending.
 * 6. No duplicate numbers.
 */
export function generateTicket(): Ticket {
  // Retry loop in case random generation gets stuck (though algorithm is robust)
  let attempts = 0;
  while (attempts < 100) {
    try {
      attempts++;
      return tryGenerateTicket();
    } catch (error: unknown) {
      // Only retry on specific generation errors (deadlocks)
      // Pass through other unexpected errors
      if (
        error instanceof Error &&
        (error.message.includes("Deadlock") ||
          error.message.includes("Failed to fill"))
      ) {
        if (attempts >= 100) {
          throw new Error(
            "Failed to generate ticket after multiple attempts"
          );
        }
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed to generate valid ticket");
}

function tryGenerateTicket(): Ticket {
  const { GRID_ROWS, GRID_COLS, NUMS_PER_ROW } = GAME_CONSTANTS;

  // 1. Create grid structure (boolean mask)
  const gridMask: boolean[][] = Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLS).fill(false));
  const rowCounts = Array(GRID_ROWS).fill(0);
  const colCounts = Array(GRID_COLS).fill(0);

  // Helper to place a token
  const place = (r: number, c: number) => {
    if (gridMask[r][c]) return false;
    gridMask[r][c] = true;
    rowCounts[r]++;
    colCounts[c]++;
    return true;
  };

  // Step A: Ensure each column has at least one number
  // To avoid biasing top rows, shuffle the order of rows we try for each column
  const cols = Array.from({ length: GRID_COLS }, (_, i) => i);
  shuffleArray(cols);

  for (const c of cols) {
    // Pick a random valid row for this column
    // Valid means row isn't full yet
    const validRows = [0, 1, 2].filter(
      (r) => rowCounts[r] < NUMS_PER_ROW
    );
    if (validRows.length === 0)
      throw new Error("Deadlock: Cannot satisfy min col requirement");

    // Pick random
    const r = validRows[Math.floor(Math.random() * validRows.length)];
    place(r, c);
  }

  // Step B: Fill remaining numbers to reach 5 per row
  // We have placed 9 numbers. Need 6 more.
  // We execute this until all rows have 5.

  // Create a list of all cells
  const allCells: { r: number; c: number }[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      allCells.push({ r, c });
    }
  }
  shuffleArray(allCells);

  for (const cell of allCells) {
    const { r, c } = cell;
    // Skip if already occupied
    if (gridMask[r][c]) continue;

    // Check constraints
    if (rowCounts[r] >= NUMS_PER_ROW) continue;
    // Can't have more than 3 per col (implicit by grid size) or...
    // actually just implicit. Max 3 is naturally enforced.

    place(r, c);

    // Stop if all rows compliant
    if (rowCounts.every((count) => count === NUMS_PER_ROW)) break;
  }

  // Final validation of structure
  if (!rowCounts.every((c) => c === NUMS_PER_ROW))
    throw new Error("Failed to fill rows correctly");
  if (!colCounts.every((c) => c > 0))
    throw new Error("Failed to fill cols correctly"); // Should be covered by Step A

  // 2. Populate numbers
  const ticket: TicketCell[][] = Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLS).fill(null));

  for (let c = 0; c < GRID_COLS; c++) {
    const range = TICKET_COLUMN_RANGES[c];
    const count = colCounts[c];

    // Generate 'count' unique random numbers in range
    const nums = generateUniqueRandoms(count, range.min, range.max);
    // Sort them
    nums.sort((a, b) => a - b);

    // Assign to occupied cells in this column
    let numIdx = 0;
    for (let r = 0; r < GRID_ROWS; r++) {
      if (gridMask[r][c]) {
        ticket[r][c] = nums[numIdx++];
      }
    }
  }

  return ticket as Ticket;
}

// Helpers

function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateUniqueRandoms(
  count: number,
  min: number,
  max: number
): number[] {
  const nums = new Set<number>();
  const available = max - min + 1;
  if (count > available)
    throw new Error(
      `Cannot generate ${count} unique numbers in range ${min}-${max}`
    );

  while (nums.size < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    nums.add(num);
  }
  return Array.from(nums);
}
