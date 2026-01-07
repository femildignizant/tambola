# Story 2.5: Generate Shareable Link & Game Code

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **host**,
I want **a shareable link and 6-digit code for my game**,
so that **I can invite players easily**.

## Acceptance Criteria

1. **Given** I have configured my game
   **When** I view the "Invite Players" section
   **Then** a unique 6-digit alphanumeric code is displayed (e.g., "ABCD12")
   **And** a shareable URL is displayed: `/game/{gameId}`
   **And** both have copy-to-clipboard buttons

2. **Given** the code is generated (at game creation)
   **When** I view the game configuration/dashboard
   **Then** I can see and copy the code/link at any time

3. **Given** I share the link
   **When** a player clicks it
   **Then** they are taken to the join game page (Epic 3, verified by URL structure)

## Tasks / Subtasks

- [x] Implement GET Game API (AC: 2)

  - [x] Update `src/app/api/games/[gameId]/route.ts`
  - [x] Add `GET` method to retrieve game details (including `gameCode`, `title`, `status`)
  - [x] Return `{ data: Game }`
  - [x] Ensure `hostId` authorization (only Host can see raw Game object, though Code is public... wait, players need code too. But this endpoint is for Host management usually. Actually, players need a separate "Join" endpoint. Host endpoint can remain protected for now, or public if strictly read-only safe fields. Let's keep it protected for Host Dashboard logic, ensuring consistency).

- [x] Create Invite UI Component (AC: 1, 2)

  - [x] Create `src/features/game/components/InviteGame.tsx` (Client Component)
  - [x] Props: `gameId`, `gameCode`
  - [x] Display `gameCode` with "Copy Code" button (Use `navigator.clipboard`)
  - [x] Construct full URL: `window.location.origin/game/[gameId]` (or use environment var for base URL)
  - [x] Display URL with "Copy Link" button
  - [x] Use `shadcn/ui` Card, Button (Icon variant for copy), Input (Read-only for display), Toast for "Copied!" feedback

- [x] Integrate into Game Config Page (AC: 2)
  - [x] Update `src/app/dashboard/game/[gameId]/config/page.tsx`
  - [x] Pass `game.gameCode` to `InviteGame` component
  - [x] Place `InviteGame` component prominently (e.g., top sidebar or separate "Invite" tab/card)

## Dev Notes

### Data Model

- `gameCode` is already generated and stored in the `Game` table during creation (Story 2.2).
- No DB schema changes required.

### API

- `GET /api/games/[gameId]`
- Response: `{ data: { ...game } }`

### UI/UX

- **Icons**: Use `Lucide React` icons (Check `Copy`, `Check` for copied state).
- **Feedback**: Immediate visual feedback when copied (Tooltip or Toast or Icon change).
- **Mobile**: Ensure link wraps or is truncated visually, but copies fully.

### References

- [Epics: Story 2.5](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-2.5:-Generate-Shareable-Link-&-Game-Code)
- [Architecture: API Patterns](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#API-&-Communication-Patterns)
