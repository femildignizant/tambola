# Story 5.1: Claim Verification Logic

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **a robust server-side claim verification utility**,
so that **only valid claims (rows, full house, etc.) are accepted and race conditions are handled atomically**.

## Acceptance Criteria

1. **Given** a player submits a claim for a specific pattern (e.g., "FIRST_ROW")
   **When** `verifyClaim(ticket, calledNumbers, pattern)` is called
   **Then** it returns `isValid: true` only if ALL numbers required for that pattern on the ticket are present in `calledNumbers`.
   **And** it returns `isValid: false` if even one number is missing.

2. **Given** the supported patterns
   **When** verifying logic runs
   **Then** it correctly validates:

   - **Early Five**: Any 5 called numbers on the ticket.
   - **Top Row**: All 5 numbers in the first row are called.
   - **Middle Row**: All 5 numbers in the second row are called.
   - **Bottom Row**: All 5 numbers in the third row are called.
   - **Four Corners**: The first and last numbers of top and bottom rows (4 numbers total) are called.
   - **Full House**: All 15 numbers on the ticket are called.

3. **Given** a valid claim
   **When** checking for duplicates
   **Then** the _caller_ (API) verifies against the central Game State to ensure this specific prize hasn't already been claimed. (Note: This utility is pure; state validation is external).

4. **Given** the verification function
   **When** inputs are provided
   **Then** it must be a pure function (deterministic) and not mutate any input state.

## Tasks / Subtasks

- [x] Define Claim Types

  - [x] Create `src/features/game/types/claims.ts` (or add to `types.ts`).
  - [x] Define `ClaimPattern` enum: `EARLY_FIVE`, `TOP_ROW`, `MIDDLE_ROW`, `BOTTOM_ROW`, `FOUR_CORNERS`, `FULL_HOUSE`.
  - [x] Define `ClaimResult` interface: `{ isValid: boolean; reason?: string; verifiedNumbers?: number[] }`.

- [x] Implement Geometric Verification Logic

  - [x] Create `src/features/game/lib/claim-verifier.ts`.
  - [x] Implement `checkPattern(ticket: Ticket, calledNumbers: number[], pattern: ClaimPattern): boolean`.
  - [x] Implement helpers:
    - `getNumbersForPattern(ticket, pattern): number[]` (extracts the relevant numbers from the grid).
    - `areAllNumbersCalled(targetNumbers, calledNumbers): boolean`.

- [x] Implement Pattern-Specific Rules

  - [x] **Early Five**: Check if count(called numbers on ticket) >= 5.
  - [x] **Rows**: Get non-null cells from specific row index.
  - [x] **Four Corners**:
    - Identify first non-null index in Row 0.
    - Identify last non-null index in Row 0.
    - Identify first non-null index in Row 2.
    - Identify last non-null index in Row 2.
  - [x] **Full House**: Get all non-null cells from entire grid.

- [x] Unit Tests
  - [x] Create `src/features/game/lib/claim-verifier.test.ts`.
  - [x] Test every pattern with mocked Ticket and CalledNumbers.
  - [x] Test edge cases:
    - Empty called numbers.
    - Partial matches (4/5 numbers called).
    - Exact matches.
    - Supersets (all numbers called + extra).
  - [x] Verify "Four Corners" specifically with tickets having empty corners (logic must find the "visual" corner, i.e., first/last number).

## Dev Notes

- **Implementation Location**: `src/features/game/lib/claim-verifier.ts`
- **Purity**: This logic is PURE. It does not fetch from DB.Fetching is the responsibility of the API route (Story 5.2). This story is just the verification engine.
- **Four Corners Logic**: Be careful. A "corner" in Tambola isn't just `[0][0]`. It's the _first available number_ in the first row, _last available number_ in the first row, etc.
- **Dependency**: Uses `Ticket` type from `src/features/game/types.ts`.

### File List

- src/features/game/types/claims.ts
- src/features/game/lib/claim-verifier.ts
- src/features/game/lib/claim-verifier.test.ts

### Project Structure Notes

- New file: `src/features/game/lib/claim-verifier.ts`
- New tests: `src/features/game/lib/claim-verifier.test.ts`

### References

- [Epics: Story 5.1](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-5.1:-Claim-Verification-Logic)
- [Architecture: Server Authority](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#Claim-Verification)
- [Types: Ticket](file:///Users/mac/Desktop/femil/tambola/src/features/game/types.ts)

## Senior Developer Review (AI)

- **Fix**: Populated `verifiedNumbers` for `EARLY_FIVE` pattern to support UI highlighting.
- **Fix**: Added runtime safety guard to `getNumbersForPattern` to prevent crashes on malformed ticket data.
- **Doc Update**: Clarified AC 3 to explicitly state duplicate checking is the API's responsibility, aligning with the pure function architecture.
