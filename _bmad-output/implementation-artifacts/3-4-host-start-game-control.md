# Story 3.4: Host Start Game Control

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **host**,
I want **to start the game when minimum players have joined**,
so that **actual gameplay begins and all players transition to the play screen**.

## Acceptance Criteria

1. **Given** I am the host
   **And** the minimum player count (2) is met
   **When** I click "Start Game"
   **Then** the game status updates to "STARTED" in DB
   **And** a `game:started` event is broadcast via Pusher
   **And** all connected clients redirect automatically to the `/play` page

2. **Given** minimum players are not met
   **When** I view the dashboard
   **Then** the Start button is disabled with a message

## Tasks / Subtasks

- [x] Create Host-Specific Start Game API Endpoint (AC: 1)

  - [x] Create `POST /api/games/[gameId]/start` route
  - [x] Validate request is from game host (check hostId against session user)
  - [x] Validate minimum player count is met (>= minPlayers from game settings)
  - [x] Update game status from `LOBBY` to `STARTED` in database
  - [x] Trigger Pusher event `game:started` with gameId and startedAt timestamp
  - [x] Return success response with updated game data
  - [x] Handle error cases: unauthorized, minimum players not met, game already started

- [x] Create Host Start Game Button Component (AC: 1, 2)

  - [x] Create `src/features/game/components/HostStartButton.tsx`
  - [x] Display "Start Game" button for host only (check if current user is host)
  - [x] Disable button if player count < minPlayers
  - [x] Show tooltip/message when disabled: "Waiting for X more players"
  - [x] Implement loading state during API call
  - [x] Handle success: show success message before redirect
  - [x] Handle errors: display error message to host

- [x] Integrate Start Button into Host Dashboard (AC: 2)

  - [x] Add HostStartButton to `src/app/dashboard/game/[gameId]/page.tsx` (host game detail page)
  - [x] Pass game data (id, minPlayers, currentPlayerCount, hostId) as props
  - [x] Position button prominently in host dashboard UI
  - [x] Show current player count vs minimum required (e.g., "5 / 2 players ready")

- [x] Update Lobby to Handle game:started Event (AC: 1)

  - [x] Modify `src/app/game/[gameId]/game-lobby-client.tsx` to listen for `game:started` event
  - [x] On event received, redirect all players to `/game/[gameId]/play`
  - [x] Show transition message: "Game is starting..."
  - [x] Ensure redirect works for both host and players

- [x] Create Play Page Placeholder (AC: 1)

  - [x] Create `src/app/game/[gameId]/play/page.tsx` (placeholder for Epic 4)
  - [x] Display game title and "Game in progress" message
  - [x] Show player's ticket (reuse TicketDisplay component)
  - [x] Add note: "Number calling will be implemented in Epic 4"

- [x] Add Validation and Error Handling (AC: 1, 2)

  - [x] Create Zod schema for start game request validation
  - [x] Validate game exists and is in LOBBY status
  - [x] Validate user is authenticated and is the host
  - [x] Validate minimum player count requirement
  - [x] Return appropriate error codes: `UNAUTHORIZED`, `MIN_PLAYERS_NOT_MET`, `GAME_ALREADY_STARTED`

- [x] Write Tests for Start Game Flow (AC: 1, 2)
  - [x] Test API endpoint: successful start, unauthorized, min players not met
  - [x] Test HostStartButton: enabled/disabled states, click handler, error display
  - [x] Test Pusher integration: verify `game:started` event triggers redirect
  - [x] Test play page: renders correctly with game data

## Dev Notes

### Critical Context from Story 3.3

**Story 3.3 implemented the lobby UI** with:

- Player join form and real-time player list
- Pusher integration for `player:joined` events
- Game lobby client component at `src/app/game/[gameId]/game-lobby-client.tsx`
- Zustand store at `src/features/game/game-store.ts`

**This story (3.4) adds the HOST control** to:

- Start the game when ready (minimum players met)
- Transition all players from lobby to play screen
- Update game status to STARTED in database
- Broadcast `game:started` event via Pusher

### Implementation Location

**New Files:**

- `src/app/api/games/[gameId]/start/route.ts` - Start game API endpoint
- `src/features/game/components/HostStartButton.tsx` - Start button component
- `src/app/game/[gameId]/play/page.tsx` - Play screen placeholder (Epic 4 will expand)

**Files to Modify:**

- `src/app/dashboard/game/[gameId]/page.tsx` - Add HostStartButton to host dashboard
- `src/app/game/[gameId]/game-lobby-client.tsx` - Add `game:started` event listener and redirect logic

**Files to Reference:**

- `src/app/api/games/[gameId]/join/route.ts` - Reference for API pattern and Pusher trigger
- `src/features/game/game-store.ts` - Zustand store for game state
- `src/lib/pusher-server.ts` - Server-side Pusher client

### Architecture Compliance

**API Endpoint Pattern:**

```typescript
// POST /api/games/[gameId]/start
// Request: No body required (gameId from URL, hostId from session)
// Success Response:
{
  data: {
    gameId: string;
    status: "STARTED";
    startedAt: string; // ISO 8601
  }
}

// Error Response:
{ error: string, code?: string }
```

**Pusher Event Format:**

```typescript
// Event: game:started
// Channel: game-{gameId}
{
  gameId: string;
  startedAt: string; // ISO 8601 timestamp
}
```

**Game Status Transition:**

- Current: `LOBBY` (from Story 3.2 when first player joins)
- After Start: `STARTED`
- Future: `COMPLETED` (Epic 5 when Full House claimed)

**Authorization Pattern:**

```typescript
// Verify host identity
const session = await auth.api.getSession({ headers: headers() });
if (!session?.user?.id) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

const game = await prisma.game.findUnique({ where: { id: gameId } });
if (game.hostId !== session.user.id) {
  return NextResponse.json(
    {
      error: "Only the host can start the game",
      code: "UNAUTHORIZED",
    },
    { status: 403 }
  );
}
```

**Minimum Player Validation:**

```typescript
const playerCount = await prisma.player.count({ where: { gameId } });
if (playerCount < game.minPlayers) {
  return NextResponse.json(
    {
      error: `Minimum ${game.minPlayers} players required. Currently ${playerCount} joined.`,
      code: "MIN_PLAYERS_NOT_MET",
    },
    { status: 400 }
  );
}
```

### Database Schema Reference

**Game Model (from schema.prisma):**

```prisma
model Game {
  id             String        @id @default(cuid())
  title          String        @db.VarChar(100)
  hostId         String
  status         GameStatus    @default(CONFIGURING)
  gameCode       String        @unique @db.VarChar(6)
  numberInterval Int           @default(10)
  minPlayers     Int           @default(2)
  maxPlayers     Int           @default(75)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  players        Player[]
  // ...
}

enum GameStatus {
  CONFIGURING
  LOBBY
  STARTED
  COMPLETED
}
```

**Key Fields for This Story:**

- `status`: Update from `LOBBY` → `STARTED`
- `minPlayers`: Validate player count against this value
- `hostId`: Verify requesting user is the host

### Host Dashboard Integration

**Current Host Dashboard Structure:**

- `src/app/dashboard/page.tsx` - Game list (from Story 2.6)
- `src/app/dashboard/game/[gameId]/page.tsx` - Individual game detail page (exists)
- `src/app/dashboard/game/[gameId]/config/page.tsx` - Game configuration (from Story 2.4)

**Where to Add Start Button:**
Add HostStartButton to `src/app/dashboard/game/[gameId]/page.tsx` (game detail page) where host can:

- View current player list
- See player count vs minimum required
- Click "Start Game" when ready

**UI Layout Suggestion:**

```
┌─────────────────────────────────────┐
│ Game: Diwali Tambola                │
│ Status: LOBBY                       │
│ Players: 5 / 2 (minimum met ✓)     │
│                                     │
│ [Player List Component]             │
│                                     │
│ [Start Game Button]                 │
│ (enabled if minPlayers met)         │
└─────────────────────────────────────┘
```

### Pusher Integration

**Server-Side (API Route):**

```typescript
import { pusherServer } from "@/lib/pusher-server";

// After updating game status to STARTED
await pusherServer.trigger(`game-${gameId}`, "game:started", {
  gameId,
  startedAt: new Date().toISOString(),
});
```

**Client-Side (Lobby Component):**

```typescript
// In src/app/game/[gameId]/game-lobby-client.tsx
useEffect(() => {
  const channel = pusherClient.subscribe(`game-${gameId}`);

  channel.bind(
    "game:started",
    (data: { gameId: string; startedAt: string }) => {
      // Show transition message
      toast.success("Game is starting!");

      // Redirect to play page
      router.push(`/game/${gameId}/play`);
    }
  );

  return () => {
    channel.unbind("game:started");
    channel.unsubscribe();
  };
}, [gameId, router]);
```

### Error Handling

**Error Scenarios:**

1. **Unauthorized (not logged in):**

   - Status: 401
   - Message: "Unauthorized"

2. **Forbidden (not the host):**

   - Status: 403
   - Code: `UNAUTHORIZED`
   - Message: "Only the host can start the game"

3. **Minimum players not met:**

   - Status: 400
   - Code: `MIN_PLAYERS_NOT_MET`
   - Message: "Minimum X players required. Currently Y joined."

4. **Game already started:**

   - Status: 400
   - Code: `GAME_ALREADY_STARTED`
   - Message: "Game has already started"

5. **Game not found:**
   - Status: 404
   - Message: "Game not found"

### Testing Strategy

**API Endpoint Tests (`route.test.ts`):**

```typescript
describe("POST /api/games/[gameId]/start", () => {
  it("should start game when host and minimum players met", async () => {
    // Setup: Create game with 2 players, minPlayers = 2
    // Action: POST /api/games/{gameId}/start as host
    // Assert: Status 200, game.status = STARTED, Pusher event triggered
  });

  it("should reject when not the host", async () => {
    // Setup: Create game, authenticate as different user
    // Action: POST /api/games/{gameId}/start
    // Assert: Status 403, error code UNAUTHORIZED
  });

  it("should reject when minimum players not met", async () => {
    // Setup: Create game with 1 player, minPlayers = 2
    // Action: POST /api/games/{gameId}/start as host
    // Assert: Status 400, error code MIN_PLAYERS_NOT_MET
  });

  it("should reject when game already started", async () => {
    // Setup: Create game with status STARTED
    // Action: POST /api/games/{gameId}/start as host
    // Assert: Status 400, error code GAME_ALREADY_STARTED
  });
});
```

**Component Tests (`HostStartButton.test.tsx`):**

```typescript
describe("HostStartButton", () => {
  it("should be enabled when minimum players met", () => {
    // Render with playerCount >= minPlayers
    // Assert: Button is enabled
  });

  it("should be disabled when minimum players not met", () => {
    // Render with playerCount < minPlayers
    // Assert: Button is disabled, shows message
  });

  it("should call API and redirect on success", async () => {
    // Setup: Mock successful API response
    // Action: Click button
    // Assert: API called, success message shown, redirect to /play
  });

  it("should display error message on failure", async () => {
    // Setup: Mock API error response
    // Action: Click button
    // Assert: Error message displayed
  });
});
```

**Integration Test (Manual Verification):**

1. Create game as host
2. Join as 1 player (below minimum of 2)
3. Verify "Start Game" button is disabled
4. Open incognito, join as 2nd player
5. Verify "Start Game" button becomes enabled
6. Click "Start Game"
7. Verify both windows redirect to `/game/{gameId}/play`
8. Verify game status is STARTED in database

### Play Page Placeholder

**Minimal Implementation for Story 3.4:**

```typescript
// src/app/game/[gameId]/play/page.tsx
export default async function PlayPage({
  params,
}: {
  params: { gameId: string };
}) {
  const { gameId } = await params;

  // Fetch game and player data
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { patterns: true },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{game.title}</h1>
      <p className="text-muted-foreground mb-8">Game in progress</p>

      {/* Placeholder for Epic 4 */}
      <div className="bg-muted p-6 rounded-lg">
        <p className="text-center">
          Number calling and ticket marking will be implemented in
          Epic 4
        </p>
      </div>
    </div>
  );
}
```

### Naming Conventions

**Following Project Standards:**

- API Route: `route.ts` (Next.js convention)
- Component: `HostStartButton.tsx` (PascalCase)
- Functions: `startGame`, `validateMinPlayers` (camelCase)
- Pusher Event: `game:started` (entity:action format)
- Error Codes: `UNAUTHORIZED`, `MIN_PLAYERS_NOT_MET` (SCREAMING_SNAKE_CASE)

### Project Structure Notes

**Alignment with Architecture:**

- API routes follow `/api/games/[gameId]/*` pattern
- Components in feature-based folder: `src/features/game/components/`
- Pusher integration uses established patterns from Story 3.3
- Error handling follows `{ error, code }` format

**No Conflicts Detected:**

- Start game endpoint is new, no overlap with existing routes
- HostStartButton is new component
- Play page is new route (Epic 4 will expand it)

### References

- [Epics: Story 3.4](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-3.4:-Host-Start-Game-Control)
- [Architecture: API Patterns](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#API-&-Communication-Patterns)
- [Architecture: Pusher Event Naming](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#Pusher-Event-Naming)
- [Project Context: Real-time Architecture](<file:///Users/mac/Desktop/femil/tambola/_bmad-output/project-context.md#Real-time-Architecture-(Pusher)>)
- [Story 3.3: Real-time Lobby](file:///Users/mac/Desktop/femil/tambola/_bmad-output/implementation-artifacts/3-3-real-time-lobby-player-count.md)
- [Story 3.2: Player Joining API](file:///Users/mac/Desktop/femil/tambola/_bmad-output/implementation-artifacts/3-2-player-joining-api-ticket-assignment.md)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- HostStartButton was added to `src/app/dashboard/game/[gameId]/config/page.tsx` as it serves as the game control center for the host.
- PlayPageClient separated client-side logic from the play page for better structure.
- Added UI tooltip component for better user experience.

### File List

- `src/app/api/games/[gameId]/start/route.ts`
- `src/app/api/games/[gameId]/start/route.test.ts`
- `src/features/game/components/HostStartButton.tsx`
- `src/features/game/components/HostStartButton.test.tsx`
- `src/app/dashboard/game/[gameId]/config/page.tsx`
- `src/app/game/[gameId]/game-lobby-client.tsx`
- `src/app/game/[gameId]/play/page.tsx`
- `src/features/game/components/PlayPageClient.tsx`
- `src/components/ui/tooltip.tsx`
- `vitest.setup.ts`
- `vitest.config.ts`
