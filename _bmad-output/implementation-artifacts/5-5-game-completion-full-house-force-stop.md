# Story 5.5: Game Completion (Full House & Force Stop)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **host**,
I want **the game to end when Full House is claimed OR when I force stop it**,
so that **we can see the final winners**.

## Acceptance Criteria

1. **Given** a player successfully claims "Full House"
   **When** the claim is verified
   **Then** the game state changes to "COMPLETED"
   **And** the number calling loop stops
   **And** a `game:ended` event is sent to all clients with `reason: "FULL_HOUSE"`
   **And** everyone sees the Final Leaderboard screen with all winners listed

2. **Given** I am the host and want to end the game early
   **When** I click "End Game" in the host controls
   **Then** the game ends immediately for all players
   **And** the game state changes to "COMPLETED"
   **And** a `game:ended` event is sent with `reason: "FORCE_STOP"`
   **And** all players are redirected to the results page

3. **Given** the game has ended (by any reason)
   **When** I view the results page
   **Then** I see the final leaderboard with all claimed patterns
   **And** I see the final scores for all players
   **And** I see the game completion reason (Full House or Force Stop)

## Tasks / Subtasks

- [ ] Task 1: Trigger game:ended on Full House claim (AC: #1)

  - [ ] Modify `src/app/api/games/[gameId]/claim/route.ts` POST handler
  - [ ] After successful FULL_HOUSE claim, update game status to "COMPLETED"
  - [ ] Broadcast `game:ended` event with `reason: "FULL_HOUSE"` and winner details
  - [ ] Add `COMPLETED` as valid GameStatus enum value if not exists

- [ ] Task 2: Create Host Force Stop API Endpoint (AC: #2)

  - [ ] Create `src/app/api/games/[gameId]/end/route.ts`
  - [ ] Implement POST handler with host authentication check
  - [ ] Update game status to "COMPLETED"
  - [ ] Broadcast `game:ended` event with `reason: "FORCE_STOP"`
  - [ ] Return success response with final game state

- [ ] Task 3: Add Host "End Game" Button UI (AC: #2)

  - [ ] Add "End Game" button to host controls in `PlayPageClient.tsx`
  - [ ] Only show for host when game is in "STARTED" status
  - [ ] Add confirmation dialog before ending (prevent accidental clicks)
  - [ ] Handle API call with loading state and error handling
  - [ ] Navigate to results page on success

- [ ] Task 4: Enhance game:ended Event Handler (AC: #1, #2, #3)

  - [ ] Update `game:ended` event type to include `reason: "FULL_HOUSE" | "FORCE_STOP" | "ALL_NUMBERS_CALLED"`
  - [ ] Modify event handler in `PlayPageClient.tsx` to handle different reasons
  - [ ] Show appropriate toast message based on reason
  - [ ] Navigate to results page with optional delay for celebration

- [ ] Task 5: Create/Enhance Results Page (AC: #3)

  - [ ] Ensure `src/app/game/[gameId]/results/page.tsx` exists and works
  - [ ] Display final leaderboard with all claimed patterns
  - [ ] Show game completion reason ("Full House Winner: {name}" or "Game Ended by Host")
  - [ ] Show all players with their final scores sorted by rank
  - [ ] Add "Back to Dashboard" navigation for host
  - [ ] Add "Play Again" or leave game option for players

- [ ] Task 6: Testing & Verification
  - [ ] Test Full House claim triggers game end correctly
  - [ ] Test host force stop works and broadcasts to all players
  - [ ] Test results page displays correctly with all data
  - [ ] Test navigation flow from play page to results page
  - [ ] Verify game cannot be interacted with after completion

## Dev Notes

### Key Insight: What's Already Implemented

From code analysis, the following infrastructure already exists:

1. **`game:ended` Event Broadcasting** - Already implemented in `call-number/route.ts` for when all 90 numbers are called
2. **`game:ended` Event Handling** - Already in `PlayPageClient.tsx` line 170, navigates to results page
3. **Game Status Enum** - `schema.prisma` has `GameStatus` with CONFIGURING, READY, STARTED (need to verify COMPLETED)
4. **Claim Route** - Does NOT currently trigger game:ended on Full House claim

**Primary Focus**: Modify claim route to end game on Full House, add host force stop endpoint, ensure results page is complete.

### Claim Route Modification

**File**: `src/app/api/games/[gameId]/claim/route.ts`

**Current behavior**: Creates claim, broadcasts `claim:accepted`, returns success
**New behavior**: If pattern is FULL_HOUSE, also:

1. Update game.status to "COMPLETED"
2. Broadcast `game:ended` event

```typescript
// After line 209 (after claim:accepted broadcast)
if (pattern === ClaimPattern.FULL_HOUSE) {
  // Update game status to COMPLETED
  await prisma.game.update({
    where: { id: gameId },
    data: { status: "COMPLETED" },
  });

  // Broadcast game:ended event
  await pusherServer.trigger(`game-${gameId}`, "game:ended", {
    reason: "FULL_HOUSE",
    winner: {
      playerId: claim.playerId,
      playerName: player.name,
      points: claim.points,
    },
    timestamp: new Date().toISOString(),
  });
}
```

### Force Stop API Endpoint

**File**: `src/app/api/games/[gameId]/end/route.ts` (NEW)

```typescript
// Endpoint structure:
// POST /api/games/{gameId}/end
// Auth: Requires host authentication
// Body: {} (empty or optional reason message)
// Response: { data: { gameId, status: "COMPLETED", reason: "FORCE_STOP" } }

// Implementation steps:
// 1. Get session/host from auth
// 2. Verify game exists and host owns it
// 3. Verify game is in STARTED status
// 4. Update game.status to "COMPLETED"
// 5. Broadcast game:ended with reason "FORCE_STOP"
// 6. Return success
```

### game:ended Event Type Enhancement

**File**: Add to `src/features/game/types/index.ts` or create new file

```typescript
export type GameEndReason =
  | "FULL_HOUSE"
  | "FORCE_STOP"
  | "ALL_NUMBERS_CALLED";

export interface GameEndedEvent {
  reason: GameEndReason;
  winner?: {
    playerId: string;
    playerName: string;
    points: number;
  };
  timestamp: string;
}
```

### Host Controls UI

**Location**: `PlayPageClient.tsx` - only show for host

```typescript
// Check if current user is host
const isHost = game.hostId === currentUserId; // Need to track this

// Render End Game button in host controls section
{
  isHost && game.status === "STARTED" && (
    <Button variant="destructive" onClick={handleEndGame}>
      End Game
    </Button>
  );
}
```

### Results Page Structure

**File**: `src/app/game/[gameId]/results/page.tsx`

**Data needed**:

- Game details (title, code)
- All claims with player names, patterns, points, ranks
- Completion reason
- All players (optional for full participation list)

**API**: Fetch from `/api/games/{gameId}` with status=COMPLETED

### Project Structure Notes

**New Files:**

- `src/app/api/games/[gameId]/end/route.ts` - Force stop endpoint

**Files to Modify:**

- `src/app/api/games/[gameId]/claim/route.ts` - Add Full House game end logic
- `src/features/game/components/PlayPageClient.tsx` - Host End Game button
- `src/app/game/[gameId]/results/page.tsx` - Enhance results display

**Existing Files to Leverage:**

- `src/features/game/components/Leaderboard.tsx` - Reuse for final results
- `src/features/game/types/claims.ts` - Claim patterns
- `src/lib/pusher-server.ts` - Event broadcasting

### References

- [Epics: Story 5.5](<file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-5.5:-Game-Completion-(Full-House-&-Force-Stop)>)
- [Story 5.4: Pattern Completion & Leaderboard](file:///Users/mac/Desktop/femil/tambola/_bmad-output/implementation-artifacts/5-4-pattern-completion-leaderboard.md)
- [Architecture: Pusher Event Naming](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#Pusher-Event-Naming)
- [Architecture: API Response Format](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#API-Response-Format)
- [FR35: Auto-end on Full House](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md) - Game automatically ends when Full House is claimed
- [FR36: Final leaderboard display](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md) - All players see final leaderboard upon game end
- [FR37: Host results summary](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md) - Hosts see final results summary

### Previous Story Intelligence (Story 5.4)

**Key Learnings:**

- `PatternStatusList.tsx` displays all enabled patterns with claim status
- `Leaderboard.tsx` shows winners sorted by rank
- Pusher event handling in `PlayPageClient.tsx` updates store automatically
- `game:ended` handler already navigates to `/game/${gameId}/results`

**Code Patterns Established:**

- Use `pusherServer.trigger()` for event broadcasting
- Update Prisma models within same transaction when possible
- Zustand store subscriptions trigger re-renders
- Toast notifications for important events (sonner library)

**Files Created in Previous Stories:**

- `src/features/game/components/Leaderboard.tsx` - Winner display component
- `src/features/game/components/PatternStatusList.tsx` - Pattern availability
- `src/features/game/types/claims.ts` - Pattern mappings and constants

### Git Intelligence

**Recent Commits:**

- `b1f5056` - Story 5.3: Claim Result Announcement
- `f4fa876` - fix bugs
- `4e2da2d` - Story 5.6: UI Layout Consistency & Navigation Patterns
- `c256dd9` - Epic 4

**Patterns from Recent Work:**

- shadcn/ui components (Button, Card, Dialog)
- Tailwind CSS styling
- Zustand store patterns
- Toast notifications with sonner

### Architecture Compliance

**Real-time Communication (NFR1: <2s broadcast latency):**

- `game:ended` event uses existing Pusher infrastructure
- Immediate broadcast on claim verification or force stop

**Security (NFR12: Server authority):**

- Game can only be ended server-side (via API)
- Host authentication required for force stop
- Client only receives and displays state

**State Management:**

- Game status change persisted to database before broadcast
- Prevents race conditions between claim and game end

### Testing Considerations

**Unit Tests:**

- Claim route: Test FULL_HOUSE claim triggers game end
- End route: Test host authentication, game status update, event broadcast

**Integration Tests:**

- Full flow: Join game → Claim Full House → Verify game ends
- Force stop: Host clicks End Game → All players see results

**Manual Verification:**

- Two browser tabs: Host and Player
- Claim Full House, verify both see results page
- Test force stop from host controls

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
