# Story 6.3: Basic Game History

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to see a list of games I've played**,
so that **I can remember my wins**.

## Acceptance Criteria

1. **Given** I am on the dashboard
   **When** I click "History" or "Past Games"
   **Then** I see a list of completed games I participated in (as host or player)
   **And** each item shows: Date, Game Name, Host name, and My Status (Won/Lost/Spectator)

2. **Given** I have not participated in any games
   **When** I view my game history
   **Then** I see an empty state with a message "No game history yet"
   **And** I see a prompt to join or create a game

3. **Given** I won prizes in a completed game (claims exist)
   **When** I view that game in history
   **Then** my status shows "Won" with my total points earned
   **And** I can see which patterns I claimed

4. **Given** I participated in a game but did not win any prizes
   **When** I view that game in history
   **Then** my status shows "Participated" (not "Lost" to avoid negative framing)

5. **Given** I was the host of a completed game
   **When** I view that game in history
   **Then** the game is included in my history
   **And** I see "Host" label in addition to any player winnings

## Tasks / Subtasks

- [x] Task 1: Create History API Endpoint (AC: #1, #2, #3, #4, #5)

  - [x] Create `/api/games/history/route.ts` endpoint
  - [x] Query games where user is host (via `hostId`) OR player (via `Player.userId`)
  - [x] Filter to only `status === "COMPLETED"` games
  - [x] Include claims (with patterns and points) for the current user
  - [x] Calculate total points per game for the user
  - [x] Order by `completedAt DESC` (most recent first)
  - [x] Return `{ data: GameHistoryItem[] }` following API format

- [x] Task 2: Create GameHistoryList Component (AC: #1, #2)

  - [x] Create `/features/game/components/GameHistoryList.tsx` (client component)
  - [x] Fetch from `/api/games/history` on mount
  - [x] Display loading skeleton while fetching
  - [x] Show empty state with CTA for no history
  - [x] Render list of history cards

- [x] Task 3: Create GameHistoryCard Component (AC: #1, #3, #4, #5)

  - [x] Create `/features/game/components/GameHistoryCard.tsx`
  - [x] Display: Game Title, Host Name, Date (completed), and Status
  - [x] Status logic: "Host", "Won (X pts)", or "Participated"
  - [x] Use Card styling consistent with `GameList.tsx`
  - [x] Show patterns claimed as badges (optional enhancement)

- [x] Task 4: Add History Tab/Section to Dashboard (AC: #1)

  - [x] Add "History" link or tab on Dashboard page
  - [x] Options: (A) Tab component on existing dashboard, (B) Separate `/dashboard/history` page
  - [x] Recommend: Tab component to keep navigation simple
  - [x] Use `Tabs` shadcn component if using tab approach

- [x] Task 5: Update Dashboard Layout (AC: #1)

  - [x] Modify `/app/dashboard/page.tsx` to include history section
  - [x] Add toggle between "Your Games" (host) and "Game History" (player)
  - [x] Maintain existing `GameList` functionality

- [x] Task 6: Unit Tests (AC: #1-5)
  - [x] Test history API returns correct games for user
  - [x] Test filtering to COMPLETED only
  - [x] Test points calculation from claims
  - [x] Test status determination (Won vs Participated vs Host)

## Dev Notes

### Key Implementation Insight

This story requires understanding **two relationships** a user can have with a game:

1. **As Host**: User's `id` matches `Game.hostId`
2. **As Player**: User's `id` matches `Player.userId` for a player in that game

**Important**: A user can be **both host AND player** in the same game (though current UI may not support this UX, the data model allows it).

### Database Query Strategy

**File**: `src/app/api/games/history/route.ts`

```typescript
// Query for games where user participated
const games = await prisma.game.findMany({
  where: {
    status: "COMPLETED",
    OR: [
      { hostId: userId }, // User is host
      { players: { some: { userId } } }, // User is player
    ],
  },
  include: {
    host: { select: { name: true } },
    players: {
      where: { userId }, // Only get this user's player record
      include: {
        claims: true, // Get their claims
      },
    },
    _count: { select: { players: true } }, // Total player count
  },
  orderBy: { completedAt: "desc" },
});
```

### Response Type Definition

**File**: `src/types/game.ts` (or inline in API route)

```typescript
interface GameHistoryItem {
  id: string;
  title: string;
  hostName: string;
  isHost: boolean;
  completedAt: string; // ISO date
  playerCount: number;
  status: "won" | "participated" | "host-only";
  totalPoints: number;
  claims: Array<{
    pattern: Pattern;
    rank: number;
    points: number;
  }>;
}
```

### Status Determination Logic

```typescript
function getPlayerStatus(
  game,
  userId
): { status: string; points: number } {
  const isHost = game.hostId === userId;
  const playerRecord = game.players.find((p) => p.userId === userId);

  if (!playerRecord) {
    // User was only a host, not a player
    return { status: "host-only", points: 0 };
  }

  const claims = playerRecord.claims || [];
  const totalPoints = claims.reduce((sum, c) => sum + c.points, 0);

  if (claims.length > 0) {
    return {
      status: isHost ? "won-host" : "won",
      points: totalPoints,
    };
  }

  return {
    status: isHost ? "participated-host" : "participated",
    points: 0,
  };
}
```

### UI Component Structure

```
Dashboard Page
├── PageHeader (existing)
├── Tabs (new)
│   ├── Tab: "Your Games" → GameList (existing)
│   └── Tab: "Game History" → GameHistoryList (new)
```

### Project Structure Notes

**Files to Create:**

- `src/app/api/games/history/route.ts` - History API endpoint
- `src/features/game/components/GameHistoryList.tsx` - History list component
- `src/features/game/components/GameHistoryCard.tsx` - Individual history card

**Files to Modify:**

- `src/app/dashboard/page.tsx` - Add history tab/section

**Existing Patterns to Follow:**

- `GameList.tsx` - Loading states, error handling, card layout
- `StatusBadge` component - Badge styling for status display
- API response format: `{ data: T[] }` or `{ error: string }`

### References

- [Epics: Story 6.3 - Basic Game History](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-6.3:-Basic-Game-History)
- [FR41: View past games](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md) - Users can view their past games
- [FR42: View past performance](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md) - Users can see their performance
- [GameList Component](file:///Users/mac/Desktop/femil/tambola/src/features/game/components/GameList.tsx) - Existing list component patterns
- [Database Schema](file:///Users/mac/Desktop/femil/tambola/prisma/schema.prisma) - Game, Player, Claim models
- [Architecture: API Response Format](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#API-Response-Format)
- [Project Context: Naming Conventions](file:///Users/mac/Desktop/femil/tambola/_bmad-output/project-context.md#Naming-Conventions)

### Previous Story Intelligence (Story 6.2)

**Key Learnings:**

- Session validation uses `playerSession` cookie OR BetterAuth session
- Server components handle auth checks, client components for interactivity
- Toast notifications using sonner for user feedback
- Card components use consistent styling from shadcn

**Code Patterns Established:**

- API routes return `{ data }` or `{ error }` format
- Client components use `useState` for loading/error states
- Skeleton loaders for async content
- Empty states include CTAs for next actions

### Architecture Compliance

**Performance:**

- Efficient Prisma query with selective includes (not loading all game data)
- Order by `completedAt` for relevant results first
- Consider pagination for users with many games (future enhancement)

**Security:**

- Server-side authentication required (BetterAuth session check)
- Only return games where user has legitimate relationship
- Never expose other players' detailed data

**UX (NFR8: Graceful degradation):**

- Loading skeleton while fetching
- Clear empty state with next action
- Positive framing: "Participated" not "Lost"

### Testing Considerations

**Unit Tests:**

- API returns games where user is host
- API returns games where user is player
- API excludes non-COMPLETED games
- API excludes games where user has no relationship
- Points calculation from claims is correct

**Integration Tests:**

- Full flow: Complete game → View history → See correct status
- Multiple users: Each user sees only their own history

**Manual Verification:**

1. Create and complete a game as host with multiple players
2. As a player who won: Verify "Won (X pts)" display
3. As a player who didn't win: Verify "Participated" display
4. As host only: Verify game appears in history

## Dev Agent Record

### Agent Model Used

Claude claude-sonnet-4-20250514

### Debug Log References

N/A - No debug issues encountered during implementation.

### Completion Notes List

1. **Task 1 Complete**: Created `/api/games/history/route.ts` with GET handler that:

   - Authenticates via BetterAuth session
   - Queries COMPLETED games where user is host OR player
   - Includes claims with patterns and points
   - Calculates total points per game
   - Returns properly typed `{ data: GameHistoryItem[] }` response

2. **Task 2 Complete**: Created `GameHistoryList.tsx` client component with:

   - API fetch on mount using useEffect
   - Loading skeleton (3 cards)
   - Error state display
   - Empty state with "No game history yet" message and CTAs (Create Game, Join Game)
   - Grid layout consistent with GameList.tsx

3. **Task 3 Complete**: Created `GameHistoryCard.tsx` component with:

   - Status display logic: "Won (X pts)", "Participated", "Host" badges
   - Completion date, host name, player count
   - Pattern badges for claimed prizes
   - Consistent Card styling with GameList.tsx

4. **Task 4 & 5 Complete**: Added Tabs to Dashboard:

   - Installed shadcn Tabs component
   - Created `DashboardTabs.tsx` client wrapper
   - Updated `dashboard/page.tsx` with "Your Games" and "Game History" tabs
   - Maintained existing GameList functionality

5. **Task 6 Complete**: Created 7 unit tests covering:
   - Authentication (401 for unauthenticated)
   - Empty history (returns empty array)
   - Host-only games (status: "host-only")
   - Won games (status: "won", points calculated)
   - Participated games (status: "participated", 0 points)
   - COMPLETED filter verification
   - Points calculation from multiple claims

### Code Review Fixes Applied

6. **Review Fixes**: Addressed issues from adversarial code review:
   - **HIGH: Ordinal Suffix Bug** - Fixed rank display (1st, 2nd, 3rd, 4th+) using `getOrdinalSuffix` helper
   - **HIGH: Error Handling** - Added response validation before accessing `data.data`
   - **MEDIUM: DRY Violation** - Created `src/types/game-history.ts` for shared types
   - **MEDIUM: Test TypeScript** - Used `GameStatus.COMPLETED` enum for proper typing

### File List

**New Files:**

- `src/app/api/games/history/route.ts`
- `src/app/api/games/history/route.test.ts`
- `src/features/game/components/GameHistoryList.tsx`
- `src/features/game/components/GameHistoryCard.tsx`
- `src/features/game/components/DashboardTabs.tsx`
- `src/components/ui/tabs.tsx` (shadcn component)
- `src/types/game-history.ts` (shared types - DRY fix)

**Modified Files:**

- `src/app/dashboard/page.tsx`
- `package.json` (tabs dependency)
- `pnpm-lock.yaml`
