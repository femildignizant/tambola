# Story 2.2: Create Game with Title

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **host**,
I want **to create a new game with a custom title**,
So that **my players can identify the game**.

## Acceptance Criteria

1. **Given** I am logged in and on the create game page
   **When** I enter a game title (1-100 chars) and submit
   **Then** a new game is created with status "CONFIGURING"
   **And** I am redirected to the game configuration page
   **And** the game is associated with my user ID as host

2. **Given** I enter an empty or too-long title
   **When** I submit
   **Then** I see a validation error

3. **Given** a game is being created
   **When** the record is saved
   **Then** a unique 6-digit alphanumeric game code is automatically generated and assigned

## Tasks / Subtasks

- [x] Create Game Creation Zod Schema (AC: 1, 2)

  - [x] Define `createGameSchema` in `src/features/game/lib/validation.ts` (new file?)
  - [x] Validate title length (1-100 characters)

- [x] Implement Game Code Generator (AC: 3)

  - [x] Create `generateGameCode` utility in `src/features/game/lib/utils.ts`
  - [x] Use `nanoid` or `crypto` to generate 6-char uppercase alphanumeric string (A-Z, 0-9)
  - [x] Ensure exclusion of ambiguous characters if desired (optional: I, 1, O, 0)

- [x] Create Game Creation API (AC: 1, 3)

  - [x] Create `POST /api/games` route in `src/app/api/games/route.ts`
  - [x] Authenticate user (get `hostId`)
  - [x] Validate request body using Zod schema
  - [x] Generate unique `gameCode` (handle potential collision with retry loop or catch unique constraint error)
  - [x] Create `Game` record in DB with default status `CONFIGURING`
  - [x] Return `{ data: { gameId } }` response

- [x] Create UI Page: Create Game (AC: 1, 2)

  - [x] Create `src/app/dashboard/create/page.tsx`
  - [x] Implement `CreateGameForm` component with shadcn/ui (Input, Button)
  - [x] Handle form submission to `POST /api/games`
  - [x] Handle loading state and errors
  - [x] Redirect to `/dashboard/game/[gameId]/config` on success

- [x] Integrate with Dashboard (AC: 1)
  - [x] Ensure `/dashboard` has a link/button to `/dashboard/create` (Basic integration)

## Dev Notes

### Implementation Details

- **Game Code Generation:**

  - Use `nanoid` with custom alphabet: `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ`
  - Length: 6 characters.
  - Logic: `customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)()`
  - Collision Handling: While collision probability is low for 6 chars (2 billion+ combinations), strictly speaking we should handle the unique constraint error from Prisma (code `P2002`) and retry once or twice.

- **API Logic:**

  - Use `better-auth` to get current session and `user.id` for `hostId`.
  - Default values for `minPlayers` (2), `maxPlayers` (75), `numberInterval` (10) should be set by Prisma defaults or explicitly in API if business logic dictates (Prisma schema in Story 2.1 has defaults).

- **UI/UX:**
  - Page: Simple centered card or form layout.
  - Title input with character count indicator (0/100).
  - Submit button: "Create Game".

### Dependencies

- **Story 2.1**: Requires `Game` table and `GameStatus` enum in database. Ensure migrations from 2.1 are applied.
- **Story 1.1**: UI components (shadcn/ui) and layout.

### Project Structure Notes

- **Feature Directory**: `src/features/game/`
  - `components/`: `CreateGameForm.tsx`
  - `lib/`: `utils.ts`, `validation.ts`
- **API**: `src/app/api/games/route.ts`
- **Page**: `src/app/dashboard/create/page.tsx`

### References

- [Epics: Story 2.2](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-2.2:-Create-Game-with-Title)
- [Story 2.1: Schema](file:///Users/mac/Desktop/femil/tambola/_bmad-output/implementation-artifacts/2-1-database-schema-for-games-patterns.md)
- [Architecture: API Patterns](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#API-&-Communication-Patterns)

## Dev Agent Record

### Agent Model Used

Antigravity (Gemini 2.0 Flash)

### Debug Log References

### Completion Notes List

- Implemented Zod schema for game creation validation.
- Implemented `nanoid` based game code generator.
- Created `/api/games` endpoint with `better-auth` integration.
- Created UI for creating games using shadcn components.
- Integrated "Create New Game" button in Dashboard.
- [Code Review] Added dependency files (package.json, lockfiles) to File List.

### File List

- src/features/game/lib/validation.ts
- src/features/game/lib/utils.ts
- src/features/game/components/CreateGameForm.tsx
- src/app/api/games/route.ts
- src/app/dashboard/create/page.tsx
- src/app/dashboard/page.tsx
- package.json
- package-lock.json
- pnpm-lock.yaml
