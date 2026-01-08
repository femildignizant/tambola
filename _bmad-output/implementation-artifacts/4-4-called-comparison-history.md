# Story 4.4: Called Comparison & History

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **player**,
I want **to see the history of called numbers**,
so that **I can manually verify if I missed one**.

## Acceptance Criteria

1. **Given** play is in progress
   **When** a number is called
   **Then** it appears in the "Last 10 Numbers" history bar
   **And** the history updates in real-time

2. **Given** I missed a number
   **When** I check the history bar
   **Then** I can see which numbers were recently called
   **And** the most recent number is visually distinct

3. **Given** I look at my ticket
   **When** numbers are called
   **Then** NO automatic highlighting or hints appear on my ticket (I must find them myself)
   **And** NO visual indicators show "Missed" numbers on the ticket

4. **Given** I am on a mobile device
   **When** I play
   **Then** the history bar is visible without excessive scrolling (layout check)

## Tasks / Subtasks

- [x] Verify/Refine NumberHistory Component (AC: 1, 2)

  - [x] Check `src/features/game/components/NumberHistory.tsx` exists and meets requirements
  - [x] Ensure it displays exactly the _last 10_ numbers (slice logic)
  - [x] Verify reverse order (newest first/left)
  - [x] Verify visual distinction for the most recent number

- [x] Verify Integration in Play Page (AC: 1, 4)

  - [x] Check `src/features/game/components/PlayPageClient.tsx`
  - [x] Ensure `calledNumbers` state is passed correctly from `useGameStore`
  - [x] Check responsive layout (desktop vs mobile placement)

- [x] Verify "No Auto-Highlighting" Constraint (AC: 3)

  - [x] Inspect `src/features/game/components/Ticket.tsx`
  - [x] Confirm `calledNumbers` are NOT used to style ticket cells (only `markedNumbers`)

- [x] Write/Update Tests
  - [x] Ensure `NumberHistory.test.tsx` covers the "last 10" and order logic
  - [x] Verify `Ticket` tests confirm no auto-highlighting (if applicable)

## Dev Notes

### Existing Implementation Context

- **Component Exists**: `src/features/game/components/NumberHistory.tsx` was likely scaffolded in Story 4.2.
- **Store Support**: `useGameStore` already tracks `calledNumbers`.
- **Primary Goal**: This story is primarily about **Verification** and **Refinement** of the history feature to ensure it fully meets the "Comparison" user journey (checking for missed numbers).

### Architecture Compliance

- **Component**: `src/features/game/components/NumberHistory.tsx`
- **Store**: `src/features/game/game-store.ts`
- **Pattern**: Pure presentation component consuming store data via parent or hooks.

### Integration Details

- `PlayPageClient` renders `NumberHistory` inside a Card.
- On mobile, ensure `NumberHistory` doesn't push the Ticket too far down (critical for UX).

### References

- [Epics: Story 4.4](_bmad-output/planning-artifacts/epics.md#Story-4.4:-Called-Comparison-&-History)
- [PRD: Journey 3](_bmad-output/planning-artifacts/prd.md#Journey-3:-The-Player-Who-Joins-Late-—-Arjuns-Catch-Up)

## Dev Agent Record

### Agent Model Used

Antigravity

### Debug Log References

- Verified `NumberHistory.test.tsx` passes.
- Created `Ticket.test.tsx` to verify manual marking constraint.

### Completion Notes List

- Verified `NumberHistory` logic matches requirements (last 10, reversed, highlighted recent).
- Confirmed `PlayPageClient` integrates `NumberHistory` correctly.
- Confirmed `Ticket` does not auto-highlight called numbers (only user-marked ones).
- Added `Ticket.test.tsx` to test manual marking interaction.
- Ran all related tests successfully.

### File List

- src/features/game/components/NumberHistory.tsx
- src/features/game/components/NumberHistory.test.tsx
- src/features/game/components/PlayPageClient.tsx
- src/features/game/components/Ticket.tsx
- src/features/game/components/Ticket.test.tsx

### Code Review Record

**Date:** 2026-01-08
**Reviewer:** Antigravity (Adversarial Review)

**Findings:**

1. **Accessibility (Medium):** `Ticket.tsx` cells were non-interactive divs.
   - _Fix:_ Changed to use `role="button"`, added `tabIndex={0}`, and implemented `onKeyDown` for keyboard support.
2. **Code Quality (Low):** `NumberHistory.tsx` used composite keys.
   - _Fix:_ Using unique number as key and changed to semantic `ul`/`li` list.
3. **Discrepancy (Medium):** `Ticket.test.tsx` was implemented but untracked/unlisted.
   - _Fix:_ Added to File List and verified tests pass.

**Outcome:** All issues automatically fixed. Tests verified. Story marked DONE.
