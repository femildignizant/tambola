# Story 5.2: Initiating a Claim

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **player**,
I want **to claim a prize when I complete a pattern**,
so that **I can win points**.

## Acceptance Criteria

1. **Given** I believe I have completed a pattern
   **When** I click the "Claim Prize" button (in the Game Controls)
   **Then** I see a list of available patterns (e.g., Early 5, Rows, Full House) in a modal.
   **And** I can select the one I want to claim (e.g., "Top Row").
   **And** the UI clearly shows which patterns are still available vs. claimed/closed.

2. **Given** I select a pattern to claim
   **When** I confirm the claim
   **Then** the claim request is sent to the server (`POST /api/games/[gameId]/claim`) immediately.
   **And** the UI shows a "Verifying..." spinner/state while waiting for the result (NFR4 interaction speed).

3. **Given** the server receives the claim
   **When** processing the request
   **Then** it performs the following checks in order:

   1. **Auth**: Is the user a valid player in this game?
   2. **Game State**: Is the game in "STARTED" state?
   3. **Pattern Availability**: Is the pattern (e.g., Early 5) still available (i.e. not claimed by max winners)?
   4. **Verification**: Calls `verifyClaim` (from Story 5.1) to validate the ticket against called numbers.

4. **Given** the claim is VALID and AVAILABLE
   **When** the server approves it
   **Then** it acquires an ATOMIC LOCK (Redis `SETNX`) for that pattern to prevent race conditions.
   **And** if lock succeeds, it persists the claim to the DB.
   **And** it broadcasts a `claim:accepted` event via Pusher.
   **And** it returns a success response to the client.

5. **Given** the verification FAILS (invalid pattern or race condition)
   **When** the server rejects it
   **Then** it returns an error response with a specific reason.
   **And** the client displays an error message (e.g., "Claim Invalid" or "Already Claimed").

## Tasks / Subtasks

- [ ] Implement Backend Logic (API Route)

  - [ ] Create `src/app/api/games/[gameId]/claim/route.ts`
  - [ ] Implement `POST` handler with Zod validation (`{ pattern: ClaimPattern }`).
  - [ ] Integrate Authentication check (`lib/auth.ts`).
  - [ ] Integrate Redis Locking logic (`lib/redis.ts`) using `SETNX` key `claim:{gameId}:{pattern}`.
  - [ ] Integrate `checkPattern` verification from `src/features/game/lib/claim-verifier.ts`.
  - [ ] Implement DB persistence (Prisma `Claim` creation).
  - [ ] Implement Pusher broadcast (`claim:accepted`).

- [ ] Implement Frontend UI

  - [ ] Create `src/features/game/components/ClaimModal.tsx` (using shadcn Dialog).
  - [ ] Update `src/features/game/components/GameControls.tsx` to add "Claim Prize" button.
  - [ ] Update `src/features/game/game-store.ts` to handle claim state (`isClaiming`, `claimError`).
  - [ ] Connect UI to API (`/api/games/${gameId}/claim`).

- [ ] Integration & Testing
  - [ ] Create `src/app/api/games/claim.test.ts` (API Integration Test).
  - [ ] Verify atomic locking logic (mock concurrent requests if possible).
  - [ ] Verify optimistic UI or loading state behavior.

## Dev Notes

- **Architecture Pattern**: Server-Authoritative. The Client only _requests_ a claim. The Server _decides_ and _broadcasts_.
- **Race Conditions**: This is the most critical part. Use `redis.setnx(key, userId)` to ensure only one player can claim a specific pattern (or pattern rank).
  - Key format: `claim:{gameId}:{pattern}` (e.g., `claim:123:EARLY_FIVE`).
  - If `setnx` returns 0, someone else claimed it milliseconds ago -> Reject.
- **Verification**: Reuse the pure function from Story 5.1 (`src/features/game/lib/claim-verifier.ts`). Do NOT rewrite this logic.
- **Error Handling**: Use `NextResponse.json({ error: "Reason" }, { status: 400 })`.

### Project Structure Notes

- API Route: `src/app/api/games/[gameId]/claim/route.ts` - New endpoint.
- Components: `src/features/game/components/ClaimModal.tsx` - New component.
- Store: `src/features/game/game-store.ts` - Update.

### References

- [Epics: Story 5.2](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-5.2:-Initiating-a-Claim)
- [Architecture: Claim Locking](<file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#Claim-Race-Condition-Handling-(Redis-SETNX)>)
- [Story 5.1: Verification Logic](file:///Users/mac/Desktop/femil/tambola/_bmad-output/implementation-artifacts/5-1-claim-verification-logic.md)

## Dev Agent Record

### Agent Model Used

Antigravity (Google Deepmind)

### Debug Log References

- Verified existence of `src/features/game/lib/claim-verifier.ts` from Story 5.1.
- Checked Architecture for Redis pattern.

### Completion Notes List

### File List

- src/app/api/games/[gameId]/claim/route.ts
- src/features/game/components/ClaimModal.tsx
- src/features/game/components/GameControls.tsx
- src/features/game/game-store.ts
- src/features/game/types/api.ts
