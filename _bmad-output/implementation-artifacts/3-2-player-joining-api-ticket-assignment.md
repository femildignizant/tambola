# Story 3.2: Player Joining API & Ticket Assignment

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **player**,
I want **to join a game using a code or link and get a ticket**,
so that **I can participate in the game**.

## Acceptance Criteria

1. **Given** I access a game link or enter a code
   **When** I submit my name (or auto-filled if logged in)
   **Then** I am added to the game's player list
   **And** a unique ticket is generated and assigned to me via Story 3.1 logic
   **And** I am returned a session/access token for this game (cookie/local storage)

2. **Given** the game is full (Max players reached)
   **When** I try to join
   **Then** I see an error "Game is full"

3. **Given** the game has already started
   **When** I try to join
   **Then** I enter in "Spectator" mode (or Late Join if allowed - handled in Epic 6, for now just join flow; if not allowed, show error)

## Tasks / Subtasks

- [ ] Update Database Schema (AC: 1)

  - [x] Add `Player` model to `prisma/schema.prisma` (fields: id, gameId, userId?, name, socketId, joinedAt)
  - [x] Add `Ticket` model to `prisma/schema.prisma` (fields: id, playerId, gameId, grid[Json], createdAt)
  - [x] Run `npx prisma migrate dev --name add_player_and_ticket`
  - [x] Regenerate Prisma client

- [ ] Implement Join Game API (AC: 1, 2, 3)

  - [x] Create `src/app/api/games/[gameId]/join/route.ts` (POST)
  - [x] Validate request body via Zod (`name`, `code` optional if via link)
  - [x] Check if Game exists and is not COMPLETED
  - [x] Check Player Count < Max Players (throw "Game is full" if reached)
  - [x] Check Game Status (if STARTED, check logic - for MVP Epic 3, maybe just allow join or error. AC says "Spectator" or "Late Join". Let's handle as: if STARTED, just add as normal for now but UI will handle state, or simpler: restrict if strictly required. Architecture defaults to allowing mid-game join in Epic 6. For Epic 3, basic join. Let's strictly follow AC: "Spectator mode". API should return status. We can allow join but return game state STARTED.)
  - [x] Transactional Logic:
    - [x] Create Player record
    - [x] Generate Ticket using `generateTicket` util (Story 3.1)
    - [x] Create Ticket record
  - [x] Trigger Pusher event `player:joined` (payload: player details)
  - [x] Return success response `{ data: { token, player, ticket } }` (or set cookie)

- [ ] Verify Join Flow (AC: 1)
  - [x] Create `src/app/api/games/[gameId]/join/route.test.ts`
  - [x] Test: Successful join with name + code
  - [x] Test: Valid ticket creation and assignment
  - [x] Test: Game full rejection
  - [x] Test: Duplicate join handling (if implementing idempotency or restrictions)

## Dev Notes

- **Implementation Location**: `src/app/api/games/[gameId]/join/route.ts`
- **Schema**: Needed `Player` and `Ticket` models were missing in previous stories.
- **Ticket Generation**: Use `generateTicket` from `src/features/game/lib/ticket-generator.ts`.
- **Pusher**: Use `trigger(channel, 'player:joined', data)`. Channel: `game-{gameId}`.
- **Auth**: API should handle both auth'd users (link `userId`) and guests (just `name`).
- **Response**: Return the generated ticket in the response so the UI can display it immediately without a second fetch.

### Project Structure Notes

- API Route: `src/app/api/games/[gameId]/join/route.ts` standard Next.js pattern.
- Models: Add to `prisma/schema.prisma`.

### References

- [Epics: Story 3.2](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-3.2:-Player-Joining-API-&-Ticket-Assignment)
- [Project Context: Real-time Architecture](<file:///Users/mac/Desktop/femil/tambola/_bmad-output/project-context.md#Real-time-Architecture-(Pusher)>)
