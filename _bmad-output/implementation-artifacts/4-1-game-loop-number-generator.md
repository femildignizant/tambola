# Story 4.1: Game Loop & Number Generator

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **a secure server-side game loop that calls numbers at configured intervals**,
so that **numbers are called fairly, stored with timestamps, and broadcast to all players in real-time**.

## Acceptance Criteria

1. **Given** the game has started (status = STARTED)
   **When** the configured interval (e.g., 10s) passes
   **Then** the server randomly selects a number from 1-90 that hasn't been called yet
   **And** the number is saved to the game state (calledNumbers array in DB)
   **And** the number is broadcast via Pusher event `number:called` with payload: `{ number: 42, sequence: 1, timestamp: "..." }`

2. **Given** all 90 numbers have been called
   **When** the game loop continues
   **Then** the game automatically ends via `game:ended` event
   **And** game status updates to `COMPLETED` in database

3. **Given** the host starts the game
   **When** the game transitions to STARTED status
   **Then** the game loop begins automatically after a short delay (3s countdown)
   **And** the first number is called after the configured interval

## Tasks / Subtasks

- [ ] Update Database Schema for Game State (AC: 1, 2)

  - [ ] Add `calledNumbers` field to Game model (Int[] array to store sequence)
  - [ ] Add `startedAt` DateTime field for tracking game start time
  - [ ] Add `completedAt` DateTime? field for tracking game completion
  - [ ] Add `currentSequence` Int field to track how many numbers have been called
  - [ ] Run Prisma migration to apply schema changes

- [ ] Create Number Generator Utility (AC: 1)

  - [ ] Create `src/features/game/lib/number-generator.ts`
  - [ ] Implement `getNextNumber(calledNumbers: number[]): number | null` function
  - [ ] Use cryptographically secure random selection (`crypto.randomInt`)
  - [ ] Return `null` when all 90 numbers have been called
  - [ ] Add unit tests for number generator

- [ ] Create Game Loop API Endpoint (AC: 1, 2, 3)

  - [ ] Create `POST /api/games/[gameId]/call-number` route
  - [ ] Validate game exists and is in STARTED status
  - [ ] Validate game has not yet called all 90 numbers
  - [ ] Call `getNextNumber()` to generate next number
  - [ ] Update game with new called number in transaction:
    - Append number to `calledNumbers` array
    - Increment `currentSequence`
    - Update `updatedAt` timestamp
  - [ ] If all 90 called: update status to COMPLETED, set `completedAt`
  - [ ] Trigger appropriate Pusher event (`number:called` or `game:ended`)
  - [ ] Return success response with called number and sequence

- [ ] Create Game Loop Scheduler (AC: 1, 3)

  - [ ] Create `src/features/game/lib/game-loop.ts` with loop management logic
  - [ ] Use `setInterval` pattern on server for number calling
  - [ ] Implement `startGameLoop(gameId: string, intervalSeconds: number)` function
  - [ ] Implement `stopGameLoop(gameId: string)` function
  - [ ] Store active loops in module-level Map for tracking
  - [ ] Handle Vercel serverless timeout constraints (see Dev Notes)

- [ ] Integrate Game Loop with Start Game (AC: 3)

  - [ ] Modify `POST /api/games/[gameId]/start` to initialize game loop
  - [ ] Add initial countdown delay (3 seconds) before first number
  - [ ] Trigger `game:countdown` event with countdown value
  - [ ] Start the game loop with configured `numberInterval`

- [ ] Create Number Called Event Handler on Client (AC: 1)

  - [ ] Update `src/app/game/[gameId]/play/page.tsx` to subscribe to Pusher
  - [ ] Listen for `number:called` event and update local state
  - [ ] Listen for `game:ended` event and redirect to results
  - [ ] Store called numbers history in Zustand game store

- [ ] Update Zustand Game Store (AC: 1)

  - [ ] Add `calledNumbers: number[]` to game store state
  - [ ] Add `currentNumber: number | null` for display
  - [ ] Add `gameSequence: number` for tracking
  - [ ] Add `addCalledNumber(num: number, sequence: number)` action
  - [ ] Add `setGameEnded()` action

- [ ] Add Error Handling and Edge Cases (AC: 1, 2)

  - [ ] Handle concurrent call-number requests (use database transaction)
  - [ ] Handle game loop cleanup when game ends
  - [ ] Handle server restart (game loop recovery strategy)
  - [ ] Return appropriate error codes for invalid states

- [ ] Write Comprehensive Tests (AC: 1, 2, 3)
  - [ ] Unit tests for `number-generator.ts` (all numbers covered, no repeats)
  - [ ] Unit tests for `game-loop.ts` (start, stop, interval handling)
  - [ ] API tests for `/api/games/[gameId]/call-number` endpoint
  - [ ] Integration test for game loop triggering Pusher events
  - [ ] Test edge case: all 90 numbers called

## Dev Notes

### Critical Context from Epic 3

**Story 3.4 implemented the game start mechanism** with:

- `POST /api/games/[gameId]/start` endpoint
- Game status transition: `LOBBY` → `STARTED`
- Pusher event `game:started` broadcast
- Redirect to `/game/[gameId]/play` page

**This story (4.1) extends the start flow** to:

- Initialize the game loop when game starts
- Call numbers at configured intervals
- Store called numbers in database
- Broadcast numbers via Pusher
- End game when all 90 numbers are called

### Implementation Location

**New Files:**

- `src/features/game/lib/number-generator.ts` - Secure random number selection
- `src/features/game/lib/number-generator.test.ts` - Unit tests
- `src/features/game/lib/game-loop.ts` - Game loop scheduler
- `src/app/api/games/[gameId]/call-number/route.ts` - Number calling API

**Files to Modify:**

- `prisma/schema.prisma` - Add calledNumbers, startedAt, completedAt, currentSequence fields
- `src/app/api/games/[gameId]/start/route.ts` - Initialize game loop on start
- `src/app/game/[gameId]/play/page.tsx` - Subscribe to number:called events
- `src/features/game/game-store.ts` - Add called numbers state

**Files to Reference:**

- `src/features/game/lib/ticket-generator.ts` - Existing random generation patterns
- `src/lib/pusher-server.ts` - Server-side Pusher client
- `src/app/api/games/[gameId]/join/route.ts` - API pattern reference

### Architecture Compliance

**Serverless Constraint (CRITICAL):**

Vercel has a **30-second function timeout**. This means traditional long-running setInterval loops will NOT work in production. The recommended approaches are:

**Option 1: Client-Initiated Polling (Recommended for MVP)**

```typescript
// Client polls server at intervals to trigger next number
// Simpler to implement, works with Vercel serverless
const callNextNumber = async () => {
  const res = await fetch(`/api/games/${gameId}/call-number`, {
    method: "POST",
  });
  // Handle response
};

// Client starts interval after game:started
useEffect(() => {
  if (gameStatus === "STARTED") {
    const interval = setInterval(
      callNextNumber,
      numberInterval * 1000
    );
    return () => clearInterval(interval);
  }
}, [gameStatus, numberInterval]);
```

**Option 2: Leader Election (Advanced)**

```typescript
// One client (host) drives the loop
// Other clients receive updates via Pusher
// More complex but reduces server load
```

**For this story, use Option 1 (Client-Initiated Polling)**:

- The play page initiates the polling interval
- Each poll calls `POST /api/games/[gameId]/call-number`
- Server validates, generates number, broadcasts to all via Pusher
- All clients receive via Pusher subscription (even the initiator)

**API Endpoint Pattern:**

```typescript
// POST /api/games/[gameId]/call-number
// Request: No body required (gameId from URL)
// Success Response:
{
  data: {
    number: 42,
    sequence: 5,  // 5th number called
    timestamp: "2026-01-08T14:30:00Z",
    remaining: 85  // Numbers remaining
  }
}

// Error Response when game ended:
{
  data: {
    ended: true,
    finalSequence: 90,
    completedAt: "2026-01-08T15:00:00Z"
  }
}

// Error Response:
{ error: string, code?: string }
```

**Pusher Events:**

```typescript
// Event: number:called
// Channel: game-{gameId}
{
  number: 42,
  sequence: 5,
  timestamp: "2026-01-08T14:30:00Z",
  remaining: 85
}

// Event: game:ended
// Channel: game-{gameId}
{
  reason: "ALL_NUMBERS_CALLED" | "FULL_HOUSE_CLAIMED",
  finalSequence: 90,
  completedAt: "2026-01-08T15:00:00Z"
}

// Event: game:countdown (optional, nice-to-have)
// Channel: game-{gameId}
{
  countdown: 3  // seconds until first number
}
```

### Database Schema Updates

**Add these fields to Game model:**

```prisma
model Game {
  // Existing fields...

  // New fields for Story 4.1
  calledNumbers  Int[]     @default([])  // Array of called numbers in order
  currentSequence Int      @default(0)   // Count of numbers called
  startedAt       DateTime?              // When game was started
  completedAt     DateTime?              // When game completed (all 90 or Full House)
}
```

**Migration command:**

```bash
npx prisma migrate dev --name add-game-loop-fields
```

### Number Generator Implementation

**Security Requirements:**

- Use `crypto.randomInt()` for cryptographically secure randomness
- Never use `Math.random()` for game logic
- All number selection happens server-side only

```typescript
// src/features/game/lib/number-generator.ts
import { randomInt } from "crypto";

const TOTAL_NUMBERS = 90;

/**
 * Get the next uncalled number for a game
 * @param calledNumbers Array of already called numbers
 * @returns Next number (1-90) or null if all called
 */
export function getNextNumber(
  calledNumbers: number[]
): number | null {
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

  // Securely select random index
  const randomIndex = randomInt(0, available.length);
  return available[randomIndex];
}

/**
 * Check if all numbers have been called
 */
export function isGameComplete(calledNumbers: number[]): boolean {
  return calledNumbers.length >= TOTAL_NUMBERS;
}
```

### Call Number API Implementation

```typescript
// src/app/api/games/[gameId]/call-number/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import {
  getNextNumber,
  isGameComplete,
} from "@/features/game/lib/number-generator";

export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = await params;

    // Fetch game with transaction lock
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        status: true,
        calledNumbers: true,
        currentSequence: true,
        numberInterval: true,
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    if (game.status !== "STARTED") {
      return NextResponse.json(
        {
          error: "Game is not in progress",
          code: "GAME_NOT_STARTED",
        },
        { status: 400 }
      );
    }

    // Check if already complete
    if (isGameComplete(game.calledNumbers)) {
      return NextResponse.json({
        data: {
          ended: true,
          finalSequence: game.currentSequence,
        },
      });
    }

    // Generate next number
    const nextNumber = getNextNumber(game.calledNumbers);

    if (nextNumber === null) {
      // Should not happen if isGameComplete check passed, but handle defensively
      return NextResponse.json({
        data: { ended: true, finalSequence: game.currentSequence },
      });
    }

    const newSequence = game.currentSequence + 1;
    const timestamp = new Date().toISOString();
    const newCalledNumbers = [...game.calledNumbers, nextNumber];
    const remaining = 90 - newCalledNumbers.length;

    // Check if this completes the game
    const gameEnds = isGameComplete(newCalledNumbers);

    // Update game in transaction
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        calledNumbers: newCalledNumbers,
        currentSequence: newSequence,
        ...(gameEnds && {
          status: "COMPLETED",
          completedAt: new Date(),
        }),
      },
    });

    // Broadcast to all players
    if (gameEnds) {
      await pusherServer.trigger(`game-${gameId}`, "game:ended", {
        reason: "ALL_NUMBERS_CALLED",
        finalSequence: newSequence,
        completedAt: timestamp,
      });
    } else {
      await pusherServer.trigger(`game-${gameId}`, "number:called", {
        number: nextNumber,
        sequence: newSequence,
        timestamp,
        remaining,
      });
    }

    return NextResponse.json({
      data: {
        number: nextNumber,
        sequence: newSequence,
        timestamp,
        remaining,
        ended: gameEnds,
      },
    });
  } catch (error) {
    console.error("[CALL_NUMBER_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to call number" },
      { status: 500 }
    );
  }
}
```

### Client-Side Integration

**Play Page State Management:**

```typescript
// src/app/game/[gameId]/play/page.tsx (client component portion)
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/features/game/game-store";
import { pusherClient } from "@/lib/pusher-client";

export function PlayGameClient({
  gameId,
  numberInterval,
  initialCalledNumbers,
}: {
  gameId: string;
  numberInterval: number;
  initialCalledNumbers: number[];
}) {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    calledNumbers,
    currentNumber,
    addCalledNumber,
    setGameEnded,
    setCalledNumbers,
  } = useGameStore();

  // Initialize with server state
  useEffect(() => {
    setCalledNumbers(initialCalledNumbers);
  }, [initialCalledNumbers, setCalledNumbers]);

  // Subscribe to Pusher events
  useEffect(() => {
    const channel = pusherClient.subscribe(`game-${gameId}`);

    channel.bind(
      "number:called",
      (data: {
        number: number;
        sequence: number;
        timestamp: string;
        remaining: number;
      }) => {
        addCalledNumber(data.number, data.sequence);
      }
    );

    channel.bind(
      "game:ended",
      (data: {
        reason: string;
        finalSequence: number;
        completedAt: string;
      }) => {
        setGameEnded();
        // Stop the polling interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        // Redirect to results page after short delay
        setTimeout(() => {
          router.push(`/game/${gameId}/results`);
        }, 2000);
      }
    );

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`game-${gameId}`);
    };
  }, [gameId, addCalledNumber, setGameEnded, router]);

  // Call number polling (only one client should drive this - use leader election or host-only)
  const callNextNumber = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/games/${gameId}/call-number`,
        {
          method: "POST",
        }
      );
      // Response handling is via Pusher, no need to process here
    } catch (error) {
      console.error("Failed to call number:", error);
    }
  }, [gameId]);

  // Note: See "Leader Election" section in Dev Notes
  // For MVP, the host client drives the loop
  // This should only run on the host's client

  return (
    <div>
      {/* Number display, history, ticket will be in Story 4.2 and 4.3 */}
      <p>Current Number: {currentNumber}</p>
      <p>Numbers Called: {calledNumbers.length} / 90</p>
    </div>
  );
}
```

### Leader Election for Loop Driver

**To prevent multiple clients from calling the API simultaneously:**

```typescript
// Simple host-only approach
// In PlayGameClient, check if current user is host
const isHost = session?.user?.id === game.hostId;

useEffect(() => {
  if (isHost && gameStatus === "STARTED") {
    // Only host drives the number calling
    intervalRef.current = setInterval(
      callNextNumber,
      numberInterval * 1000
    );
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }
}, [isHost, gameStatus, numberInterval, callNextNumber]);
```

**Alternative: Use first-connected player via Pusher presence channel**

### Zustand Game Store Updates

```typescript
// src/features/game/game-store.ts
// Add these to existing store

interface GameState {
  // Existing fields...

  // New fields for Story 4.1
  calledNumbers: number[];
  currentNumber: number | null;
  gameSequence: number;
  isGameEnded: boolean;

  // New actions
  setCalledNumbers: (numbers: number[]) => void;
  addCalledNumber: (number: number, sequence: number) => void;
  setGameEnded: () => void;
  resetGameState: () => void;
}

const useGameStore = create<GameState>((set) => ({
  // ...existing state

  calledNumbers: [],
  currentNumber: null,
  gameSequence: 0,
  isGameEnded: false,

  setCalledNumbers: (numbers) =>
    set({
      calledNumbers: numbers,
      currentNumber:
        numbers.length > 0 ? numbers[numbers.length - 1] : null,
      gameSequence: numbers.length,
    }),

  addCalledNumber: (number, sequence) =>
    set((state) => ({
      calledNumbers: [...state.calledNumbers, number],
      currentNumber: number,
      gameSequence: sequence,
    })),

  setGameEnded: () => set({ isGameEnded: true }),

  resetGameState: () =>
    set({
      calledNumbers: [],
      currentNumber: null,
      gameSequence: 0,
      isGameEnded: false,
    }),
}));
```

### Error Handling

**Error Scenarios:**

1. **Game not found:**

   - Status: 404
   - Message: "Game not found"

2. **Game not started:**

   - Status: 400
   - Code: `GAME_NOT_STARTED`
   - Message: "Game is not in progress"

3. **Game already completed:**

   - Status: 200 (not an error, informational)
   - Response: `{ data: { ended: true, finalSequence: 90 } }`

4. **Concurrent calls (race condition):**
   - Handle with database transaction
   - Second request should see updated calledNumbers

### Testing Strategy

**Unit Tests (`number-generator.test.ts`):**

```typescript
describe("getNextNumber", () => {
  it("should return a number between 1-90", () => {
    const num = getNextNumber([]);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(90);
  });

  it("should not return already called numbers", () => {
    const called = [1, 2, 3, 4, 5];
    const num = getNextNumber(called);
    expect(called).not.toContain(num);
  });

  it("should return null when all 90 numbers called", () => {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    const num = getNextNumber(allNumbers);
    expect(num).toBeNull();
  });

  it("should be cryptographically random", () => {
    // Run 1000 iterations and verify distribution
    const counts = new Map<number, number>();
    for (let i = 0; i < 1000; i++) {
      const num = getNextNumber([])!;
      counts.set(num, (counts.get(num) || 0) + 1);
    }
    // Each number should be selected roughly equally
    // Allow 50% variance for randomness
  });
});

describe("isGameComplete", () => {
  it("should return false with fewer than 90 numbers", () => {
    expect(isGameComplete([1, 2, 3])).toBe(false);
  });

  it("should return true with all 90 numbers", () => {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    expect(isGameComplete(allNumbers)).toBe(true);
  });
});
```

**API Tests (`route.test.ts`):**

```typescript
describe("POST /api/games/[gameId]/call-number", () => {
  it("should call next number successfully", async () => {
    // Setup: Create game with status STARTED
    // Action: POST /api/games/{gameId}/call-number
    // Assert: Returns number 1-90, sequence incremented
  });

  it("should not repeat already called numbers", async () => {
    // Setup: Create game with calledNumbers = [1, 2, 3]
    // Action: POST /api/games/{gameId}/call-number
    // Assert: Returned number not in [1, 2, 3]
  });

  it("should end game when all 90 numbers called", async () => {
    // Setup: Create game with 89 numbers called
    // Action: POST /api/games/{gameId}/call-number
    // Assert: game:ended event triggered, status = COMPLETED
  });

  it("should reject when game not started", async () => {
    // Setup: Create game with status LOBBY
    // Action: POST /api/games/{gameId}/call-number
    // Assert: 400 error, code GAME_NOT_STARTED
  });
});
```

### Performance Considerations

- **Database Updates:** Use `$push` operation for array append (Prisma doesn't have native push, use regular update)
- **Pusher Rate Limits:** Each number call = 1 message, 200k/day limit = ~2,222 games of 90 numbers/day
- **Concurrent Access:** Database transaction ensures no duplicate numbers called

### Naming Conventions

**Following Project Standards:**

- API Route: `route.ts` (Next.js convention)
- Utility File: `number-generator.ts` (kebab-case)
- Functions: `getNextNumber`, `isGameComplete` (camelCase)
- Pusher Events: `number:called`, `game:ended` (entity:action format)
- Error Codes: `GAME_NOT_STARTED`, `ALL_NUMBERS_CALLED` (SCREAMING_SNAKE_CASE)

### Project Structure Notes

**Alignment with Architecture:**

- API routes follow `/api/games/[gameId]/*` pattern
- Game logic in feature-based folder: `src/features/game/lib/`
- Pusher integration uses established patterns from Story 3.3/3.4
- Error handling follows `{ error, code }` format

**No Conflicts Detected:**

- call-number endpoint is new, no overlap with existing routes
- number-generator is new utility file
- Database schema additions are backward compatible

### References

- [Epics: Story 4.1](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-4.1:-Game-Loop-&-Number-Generator)
- [Architecture: API Patterns](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#API-&-Communication-Patterns)
- [Architecture: Pusher Event Naming](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#Pusher-Event-Naming)
- [Project Context: Number Calling](file:///Users/mac/Desktop/femil/tambola/_bmad-output/project-context.md#Number-Calling)
- [Project Context: Security Anti-Patterns](file:///Users/mac/Desktop/femil/tambola/_bmad-output/project-context.md#Security-Anti-Patterns)
- [Story 3.4: Host Start Game Control](file:///Users/mac/Desktop/femil/tambola/_bmad-output/implementation-artifacts/3-4-host-start-game-control.md)
- [Ticket Generator Implementation](file:///Users/mac/Desktop/femil/tambola/src/features/game/lib/ticket-generator.ts)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
