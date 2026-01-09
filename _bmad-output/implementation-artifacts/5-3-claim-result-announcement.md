# Story 5.3: Claim Result Announcement

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **player**,
I want **to know if my claim was successful**,
so that **I get credit for my win**.

## Acceptance Criteria

1. **Given** my claim is VALID
   **When** the server processes it
   **Then** I see a "Congratulations!" success animation in the UI
   **And** a global announcement is broadcast to ALL players: "{Player} claimed {Pattern}!"
   **And** my score updates on the leaderboard immediately

2. **Given** my claim is INVALID (Bogus claim)
   **When** the server processes it
   **Then** I see a simple error message: "Invalid Claim"
   **And** NO global announcement is made (to avoid spam)
   **And** I cannot spam claims (cooldown of 3-5 seconds applied)

3. **Given** a player makes a valid claim
   **When** the `claim:accepted` Pusher event is broadcast
   **Then** ALL players in the game receive the announcement
   **And** the announcement displays: player name, pattern claimed, and points awarded
   **And** the leaderboard updates for all players in real-time

4. **Given** a player makes an invalid claim
   **When** the claim is rejected
   **Then** only the claiming player sees the error message
   **And** other players do NOT receive any notification
   **And** a client-side cooldown prevents the same player from claiming again for 3-5 seconds

## Tasks / Subtasks

- [ ] Implement Frontend Claim Result Feedback (AC: #1, #2, #4)

  - [ ] Update `src/features/game/components/ClaimModal.tsx` to show success/error states
  - [ ] Add success animation/toast for valid claims ("Congratulations!")
  - [ ] Add error toast for invalid claims ("Invalid Claim")
  - [ ] Implement client-side claim cooldown (3-5 seconds) to prevent spam
  - [ ] Update `src/features/game/game-store.ts` to track cooldown state

- [ ] Implement Global Announcement System (AC: #3)

  - [ ] Create `src/features/game/components/ClaimAnnouncement.tsx` component
  - [ ] Subscribe to `claim:accepted` Pusher event in `PlayPageClient.tsx`
  - [ ] Display announcement toast/banner with: "{Player} claimed {Pattern}! (+{Points} points)"
  - [ ] Auto-dismiss announcement after 5-7 seconds

- [ ] Implement Real-time Leaderboard Updates (AC: #1, #3)

  - [ ] Update `src/features/game/components/Leaderboard.tsx` to subscribe to `claim:accepted` events
  - [ ] Update player scores in real-time when claims are accepted
  - [ ] Add visual highlight/animation for score changes
  - [ ] Ensure leaderboard sorting updates correctly

- [ ] Integration & Testing
  - [ ] Test valid claim flow: success feedback + global announcement + leaderboard update
  - [ ] Test invalid claim flow: error message only, no announcement, cooldown applied
  - [ ] Test claim cooldown: verify 3-5 second delay before next claim allowed
  - [ ] Test multi-player scenario: verify all players receive announcements
  - [ ] Verify TypeScript compilation passes

## Dev Notes

### Architecture Pattern: Event-Driven UI Updates

- **Server Authority**: The API route (`/api/games/[gameId]/claim`) already handles verification and broadcasts `claim:accepted` via Pusher (implemented in Story 5.2)
- **Client Responsibility**: This story focuses on the CLIENT-SIDE response to claim results
  - Success/error feedback for the claiming player
  - Global announcements for all players
  - Real-time leaderboard updates

### Pusher Event Integration

**Event Already Broadcast (from Story 5.2):**

```typescript
// Event: claim:accepted
// Payload: {
//   playerId: string,
//   playerName: string,
//   pattern: ClaimPattern,
//   points: number,
//   rank: number,
//   timestamp: string
// }
```

**Client Subscription Pattern:**

```typescript
// In PlayPageClient.tsx or useGameState hook
pusherChannel.bind("claim:accepted", (data) => {
  // 1. Show global announcement to all players
  // 2. Update leaderboard scores
  // 3. If current user is claimer, show success feedback
});
```

### Claim Cooldown Implementation

**Client-Side Cooldown (Prevent Spam):**

- After submitting a claim, disable the "Claim Prize" button for 3-5 seconds
- Store cooldown state in `game-store.ts`: `lastClaimTimestamp: number | null`
- Check cooldown before allowing new claim submission

**Rationale:** Prevents accidental double-claims and UI spam. Server-side verification is still authoritative.

### UI/UX Patterns

**Success Feedback (Claiming Player):**

- Use shadcn/ui `Toast` component with success variant
- Message: "Congratulations! You claimed {Pattern}!"
- Auto-dismiss after 3-4 seconds
- Close ClaimModal automatically

**Error Feedback (Claiming Player):**

- Use shadcn/ui `Toast` component with destructive variant
- Message: "Invalid Claim" (simple, no details to avoid confusion)
- Auto-dismiss after 3 seconds
- Keep ClaimModal open (allow retry after cooldown)

**Global Announcement (All Players):**

- Use shadcn/ui `Toast` component with default variant
- Message: "{PlayerName} claimed {Pattern}! (+{Points} points)"
- Position: Top-right or top-center
- Auto-dismiss after 5-7 seconds
- Consider adding a subtle sound effect (optional)

**Leaderboard Update:**

- Highlight the updated player's row with a subtle animation (e.g., flash green)
- Re-sort leaderboard if rankings change
- Smooth transition animations

### Project Structure Notes

**Files to Modify:**

- `src/features/game/components/ClaimModal.tsx` - Add success/error feedback
- `src/features/game/components/PlayPageClient.tsx` - Subscribe to `claim:accepted`, show announcements
- `src/features/game/components/Leaderboard.tsx` - Real-time score updates
- `src/features/game/game-store.ts` - Add cooldown state

**New Files:**

- `src/features/game/components/ClaimAnnouncement.tsx` (optional - can use Toast directly)

**Dependencies:**

- shadcn/ui `Toast` component (may need to add if not already installed)
- Existing Pusher subscription from Story 5.2

### Testing Requirements

**Unit Tests:**

- Test cooldown logic in game-store
- Test leaderboard sorting after score updates

**Integration Tests:**

- Test Pusher event handling for `claim:accepted`
- Test UI state transitions (success/error feedback)

**Manual Testing:**

- Open two browser windows (different players)
- Player 1 makes valid claim → verify both players see announcement and leaderboard update
- Player 1 makes invalid claim → verify only Player 1 sees error, no announcement
- Player 1 tries to claim immediately after → verify cooldown prevents submission

### References

- [Epics: Story 5.3](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-5.3:-Claim-Result-&-Announcement)
- [Architecture: Pusher Event Naming](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#Pusher-Event-Naming)
- [Story 5.2: Initiating a Claim](file:///Users/mac/Desktop/femil/tambola/_bmad-output/implementation-artifacts/5-2-initiating-a-claim.md) - Claim API and Pusher broadcast
- [Architecture: Error Handling Patterns](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#Error-Handling-Patterns)

### Previous Story Intelligence (Story 5.2)

**Key Learnings from Story 5.2:**

- Claim API route already broadcasts `claim:accepted` event via Pusher
- `ClaimModal.tsx` already handles claim submission and loading states
- `game-store.ts` already has claim state management (`isClaiming`, `claimError`, `claimedPatterns`)
- Redis SETNX locking ensures atomic claim processing
- Centralized pattern mapping in `src/features/game/types/claims.ts`

**Code Patterns Established:**

- Use `CLAIM_PATTERN_TO_DB_PATTERN` for pattern mapping
- Use `PATTERN_DISPLAY_INFO` for UI display
- Pusher events follow `{entity}:{action}` format
- Error responses: `{ error: string }`
- Success responses: `{ data: T }`

**Files Created/Modified in Story 5.2:**

- `src/app/api/games/[gameId]/claim/route.ts` - Claim API with Pusher broadcast
- `src/features/game/components/ClaimModal.tsx` - Pattern selection modal
- `src/features/game/components/PlayPageClient.tsx` - Pusher subscription setup
- `src/features/game/game-store.ts` - Claim state management
- `src/features/game/types/claims.ts` - Centralized mappings

**Reuse Opportunities:**

- Extend existing Pusher subscription in `PlayPageClient.tsx`
- Extend `game-store.ts` with cooldown state
- Reuse `ClaimModal.tsx` for success/error feedback
- Reuse pattern display info from `types/claims.ts`

### Git Intelligence

**Recent Commits:**

- `546d4fc` - Story 5.2: Initiating a Claim (claim API, modal, Pusher broadcast)
- `7d76f0c` - Story 5.1: Claim Verification Logic (pattern verification)
- `cc3847e` - Conflict resolved
- `b021ec3` - Story 4.4: Called Comparison & History
- `c256dd9` - Epic 4 completion

**Patterns from Recent Work:**

- Consistent use of shadcn/ui components (Dialog, Button, etc.)
- Pusher event subscriptions in `PlayPageClient.tsx`
- Zustand store updates for game state
- TypeScript strict typing throughout
- Comprehensive error handling

### Architecture Compliance

**Real-time Communication (NFR1: <2s broadcast latency):**

- Use Pusher `claim:accepted` event for instant announcements
- Ensure all players receive updates within 2 seconds

**Performance (NFR4: <100ms interaction response):**

- Client-side cooldown check (instant feedback)
- Optimistic UI updates for leaderboard

**Security (NFR12: Server authority):**

- Server already handles claim verification (Story 5.2)
- Client only displays results, cannot manipulate scores

**Reliability (NFR8: Graceful degradation):**

- Show error messages, never blank screens
- Handle Pusher connection failures gracefully

### Latest Technical Information

**shadcn/ui Toast Component:**

- Install: `npx shadcn@latest add toast`
- Usage: Import `useToast` hook, call `toast({ title, description, variant })`
- Variants: `default`, `destructive`, `success` (may need custom variant)

**Pusher Client Best Practices:**

- Unbind events on component unmount to prevent memory leaks
- Use `pusherChannel.bind()` for event subscription
- Use `pusherChannel.unbind()` in cleanup

**Zustand State Updates:**

- Use `set()` for state updates
- Use `get()` for reading current state
- Keep state updates atomic and minimal

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
