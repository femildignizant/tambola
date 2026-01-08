# Story 4.3: Interactive Ticket Marking

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **player**,
I want **to mark numbers on my ticket**,
so that **I can track my progress**.

## Acceptance Criteria

1. **Given** I see my ticket on screen
   **When** I tap a number
   **Then** the number cell toggles state (Marked/Unmarked) instantly
   **And** the change is persisted to the server immediately ("Sync on Mark")

2. **Given** I mark a number that hasn't been called yet
   **When** I tap it
   **Then** it marks successfully (Player responsibility to mark correctly)

3. **Given** I reload the page
   **When** the game state loads
   **Then** my marked numbers are preserved

4. **Given** I am playing
   **When** I look at my ticket
   **Then** NO automatic highlighting or hints appear for called numbers (I must find them myself)

## Tasks / Subtasks

- [x] Update Database Schema (AC: 1, 3)

  - [x] Add `markedNumbers Int[] @default([])` to `Ticket` model in `prisma/schema.prisma`
  - [x] Run `npx prisma migrate dev --name add_marked_numbers_to_ticket`
  - [x] Regenerate Prisma client

- [x] Create Ticket Component (AC: 1, 4)

  - [x] Create `src/features/game/components/Ticket.tsx`
  - [x] Render 3x9 grid based on `ticket.grid` data
  - [x] Implement visual styles for Marked vs Unmarked cells (use `cn` for conditional classes)
  - [x] Ensure NO auto-highlighting of called numbers

- [x] Implement Mark Logic & Optimistic UI (AC: 1, 2)

  - [x] Update `useGameStore` to include `markedNumbers` in ticket state
  - [x] Implement `toggleMark(number)` action in store
  - [x] Update local state immediately (optimistic)
  - [x] Send API request to `/api/games/[gameId]/ticket/mark` (POST)
  - [x] Handle API errors (revert mark if failed)

- [x] Create Mark API Endpoint (AC: 1, 3)

  - [x] Create `src/app/api/games/[gameId]/ticket/mark/route.ts`
  - [x] Validate session and game status
  - [x] Update `Ticket` record in DB (add/remove number from `markedNumbers` array)
  - [x] Return updated ticket state

- [x] Integrate into Play Page (AC: 1)

  - [x] Add `Ticket` component to `PlayPageClient.tsx`
  - [x] Connect to `useGameStore` for ticket data

- [x] Write Tests (AC: 1, 2, 3)
  - [x] Unit tests for `Ticket` component (rendering, click events) (SKIPPED per user request)
  - [x] Integration test for `toggleMark` logic in store (SKIPPED per user request)
  - [x] API route test (mock DB) (SKIPPED per user request)

## Dev Notes

### Critical Context from Story 4.2 & Architecture

- **State Management**: `useGameStore` holds the `ticket` data. You need to ensure `markedNumbers` is synced.
- **Database**: The `Ticket` model currently lacks `markedNumbers`. You MUST add it.
- **API Pattern**: Use `NextRequest` and `NextResponse`. Return `{ data }` or `{ error }`.
- **Optimistic UI**: Essential for "instant" feel (NFR4).
- **Security**: Validate that the ticket belongs to the user (via `playerId` linked to session).

### Implementation Details

**Schema Change:**

```prisma
model Ticket {
  // ... existing fields
  markedNumbers Int[] @default([])
}
```

**API Endpoint:**

- `POST /api/games/[gameId]/ticket/mark`
- Body: `{ number: 42, action: "MARK" | "UNMARK" }` (or just toggle logic on server based on current state, but explicit action is safer)
- Response: `{ data: { markedNumbers: [1, 5, 42] } }`

**Visuals:**

- Marked state: Distinct background color (e.g., `bg-primary text-primary-foreground`).
- Unmarked state: Default background.
- Grid layout: CSS Grid `grid-cols-9`.

### Architecture Compliance

- **Components**: `src/features/game/components/Ticket.tsx`
- **API**: `src/app/api/games/[gameId]/ticket/mark/route.ts`
- **Store**: `src/features/game/game-store.ts`

### References

- [Epics: Story 4.3](file:///home/digni/Documents/Projects/tambola/_bmad-output/planning-artifacts/epics.md#Story-4.3:-Interactive-Ticket-Marking)
- [Architecture: Frontend Architecture](file:///home/digni/Documents/Projects/tambola/_bmad-output/planning-artifacts/architecture.md#Frontend-Architecture)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Implemented `Ticket` component with grid rendering and mark interaction.
- Updated `useGameStore` to handle `markedNumbers` state and optimistic updates.
- Created API endpoint `/api/games/[gameId]/ticket/mark` for persisting marks.
- Updated `PlayPageClient` to integrate `Ticket` component and sync marked numbers.
- Added `markedNumbers` to `Ticket` model in Prisma schema.
- **Skipped automated tests** as per user request. Verified via type check.

### File List

- `src/features/game/components/Ticket.tsx`
- `src/features/game/game-store.ts`
- `src/app/api/games/[gameId]/ticket/mark/route.ts`
- `src/features/game/components/PlayPageClient.tsx`
- `src/app/api/games/[gameId]/verify-player/route.ts`
- `src/app/api/games/[gameId]/verify-player/route.ts`
- `prisma/schema.prisma`

## Senior Developer Review (AI)

### AI Fix Record

- **Security**: Fixed critical vulnerability in `verify-player` API. Added `token` field to `Player` schema and enforced token verification to prevent unauthorized ticket access.
- **Code Quality**: Fixed `any` type in `Ticket.tsx` by defining strict `grid` prop type.
- **Schema**: Added `token` to `Player` model (migration `20260108130008_add_token_to_player`).

### Bug Fixes (Dev Agent)

- **Ticket Marking Error**: Fixed "Failed to sync mark" error.
  - Updated `game-store.ts` to send `Authorization` header with player token.
  - Updated `mark/route.ts` to verify player using token instead of session.
  - Fixed `gameId` reference in `game-store.ts`.

**Issues Resolved:** 2 (1 High, 1 Medium)
**Action Items:** 0
