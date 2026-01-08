# Story 3.1: Tambola Ticket Generator Logic

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **a robust utility to generate valid Tambola tickets**,
so that **every player gets a correct 3x9 grid ticket**.

## Acceptance Criteria

1. **Given** the ticket generator is called
   **When** generating a ticket
   **Then** it returns a 3x9 grid structure
   **And** each row has exactly 5 numbers (15 total numbers)
   **And** each column has numbers within specific ranges (Col 1: 1-9, Col 2: 10-19... Col 9: 80-90)
   **And** numbers are sorted in ascending order within columns
   **And** no duplicate numbers exist
   **And** the generator runs efficiently (fast enough for bulk generation if needed)

## Tasks / Subtasks

- [x] Define Ticket Types (AC: 1)

  - [x] Implement `Ticket` and `TicketCell` interfaces
  - [x] Suggested location: `src/features/game/types.ts` (new file) or `src/types/game.ts`
  - [x] Define grid structure type (Array of Arrays or flat list with cell mapping)

- [x] Implement Generator Logic (AC: 1)

  - [x] Create `src/features/game/lib/ticket-generator.ts`
  - [x] Implement `generateTicket()` function
  - [x] Algorithm constraints:
    - 3 rows, 9 columns
    - Total 15 numbers
    - Exactly 5 numbers per row
    - Each column must have at least 1 number (standard rule)
    - Column ranges:
      - Col 1: 1-9
      - Col 2: 10-19
      - Col 3: 20-29
      - Col 4: 30-39
      - Col 5: 40-49
      - Col 6: 50-59
      - Col 7: 60-69
      - Col 8: 70-79
      - Col 9: 80-90 (Note: 11 numbers)
    - Sort numbers in each column ascending

- [x] Verify Generator Logic (AC: 1)
  - [x] Create `src/features/game/lib/ticket-generator.test.ts`
  - [x] Test: `should return 3 rows`
  - [x] Test: `should have 15 numbers total`
  - [x] Test: `should have 5 numbers per row`
  - [x] Test: `numbers should be within valid column ranges`
  - [x] Test: `numbers in columns should be sorted`
  - [x] Test: `no duplicate numbers`
  - [x] Bulk test: Generate 1000 tickets and verify validity

## Dev Notes

- **Implementation Location**: `src/features/game/lib/ticket-generator.ts`
- **Logic Complexity**:
  - The main challenge is satisfying "5 per row" AND "at least 1 per col" AND "ranges" simultaneously randomly.
  - A common valid algorithm:
    1. Place 1 number in each of the 9 columns (randomly from valid range).
    2. Place remaining 6 numbers randomly in columns (max 3 numbers per column constraint is typical for Tambola visuals, but check AC. AC says "3x9 grid", implicitly max 3 per col).
    3. Ensure total 15.
    4. Distribute into rows such that each row gets 5. (This assignment step needs care to avoid invalid states, e.g. 3 numbers in a col must fill all 3 rows).
  - Purity: The function should be pure `() => Ticket`.

### Project Structure Notes

- New file: `src/features/game/types.ts` (if standard `src/types` not used).
- New logic: `src/features/game/lib/ticket-generator.ts`.

### References

- [Epics: Story 3.1](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-3.1:-Tambola-Ticket-Generator-Logic)
- [Architecture: Project Structure](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#Project-Structure)

## Dev Agent Record

### File List

#### [NEW] [ticket-generator.ts](file:///Users/mac/Desktop/femil/tambola/src/features/game/lib/ticket-generator.ts)

#### [NEW] [ticket-generator.test.ts](file:///Users/mac/Desktop/femil/tambola/src/features/game/lib/ticket-generator.test.ts)

#### [NEW] [types.ts](file:///Users/mac/Desktop/femil/tambola/src/features/game/types.ts)

#### [MODIFY] [package.json](file:///Users/mac/Desktop/femil/tambola/package.json) (Added test script)

## Change Log

- Implemented `generateTicket` logic in `src/features/game/lib/ticket-generator.ts` using a structured grid generation algorithm to satisfy all geometric constraints (5 per row, min 1 per col).
- Defined `Ticket` type and `TICKET_COLUMN_RANGES` in `src/features/game/types.ts`.
- Added comprehensive unit tests in `src/features/game/lib/ticket-generator.test.ts` covering structure, sorting, ranges, uniqueness, and bulk robustness.
- Configured `scripts.test` in `package.json` to run Vitest.

## AI Fix Record

- Fixed error handling in `generateTicket` to specifically target deadlock retry conditions (Medium).
- Linked `GRID_ROWS`, `GRID_COLS`, `NUMS_PER_ROW` constants between `types.ts` and generator logic (Low).
- Strengthened `should generate robustly (bulk test)` to perform full validation on every generated ticket (Low).
- Fixed implicit `any` types in test callbacks.

**Issues Resolved:** 4
**Action Items:** 0
