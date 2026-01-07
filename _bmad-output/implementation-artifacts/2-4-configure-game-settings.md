# Story 2.4: Configure Game Settings

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **host**,
I want **to set the number calling interval and player limits**,
so that **the game pace matches my audience**.

## Acceptance Criteria

1. **Given** I am on the game configuration page
   **When** I select a number interval (7s, 10s, or 15s)
   **Then** the interval is saved for this game

2. **Given** I set min players (2-75) and max players (2-75)
   **When** min ≤ max and both are in valid range
   **Then** the limits are saved

3. **Given** I enter invalid limits (min > max or out of range)
   **When** I try to save
   **Then** I see a validation error

## Tasks / Subtasks

- [x] Define Game Settings Validation Schema (AC: 1, 2, 3)

  - [x] Update `src/features/game/lib/validation.ts`
  - [x] Add `gameSettingsSchema` validating:
    - `numberInterval` (Enum/Literal: 7, 10, 15)
    - `minPlayers` (Int, 2-75)
    - `maxPlayers` (Int, 2-75)
    - **Refine:** Ensure `minPlayers <= maxPlayers` via `.refine()`.

- [x] Implement Game Settings API (AC: 1, 2, 3)

  - [x] Create `PATCH /api/games/[gameId]` (General update endpoint)
    - _Note:_ This will handle partial updates for settings fields.
  - [x] Validate `hostId` (Host ownership)
  - [x] Validate input with `gameSettingsSchema`
  - [x] Update `Game` record in database
  - [x] Return updated game object

- [x] Create Settings Configuration UI (AC: 1, 2, 3)

  - [x] Create `src/features/game/components/GameSettingsForm.tsx`
  - [x] Use `shadcn/ui` Card, Label, Input, Slider (maybe?), Select/Radio
  - [x] **Interval Input:** Radio Group or Select aimed at "7s (Fast)", "10s (Normal)", "15s (Relaxed)"
  - [x] **Player Limits:** Two numeric inputs (Min, Max)
  - [x] Validation: Show error if Min > Max immediately
  - [x] Save Button: "Update Settings" (Disabled if no changes or invalid)

- [x] Integrate into Game Config Page (AC: 1)
  - [x] Update `src/app/dashboard/game/[gameId]/config/page.tsx`
  - [x] Add `GameSettingsForm` component
  - [x] Arrange logic: Title/Input (Story 2.2), Settings (Story 2.4), Patterns (Story 2.3)
    - _Suggestion:_ A tabs layout or vertical stack of Cards.
    - _Order:_ Basic Info (Title) -> Settings -> Patterns.

## Dev Notes

### Schema & Data Model

- **DB Fields:** `numberInterval`, `minPlayers`, `maxPlayers` (Integers/Int)
- **Constraints:**
  - `numberInterval` IN (7, 10, 15)
  - `minPlayers` >= 2, `maxPlayers` <= 75
  - `minPlayers` <= `maxPlayers`

### API

- **Endpoint:** `PATCH /api/games/[gameId]`
- **Body:** `{ "numberInterval": 10, "minPlayers": 5, "maxPlayers": 50 }`
- **Response:** `{ data: { ...updatedGame } }`

### UI/UX

- **Validation:** Client-side validation using Zod before submission is critical for Min/Max logic.
- **Feedback:** Toast notification on success ("Settings updated").

### References

- [Epics: Story 2.4](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-2.4:-Configure-Game-Settings)
- [Architecture: API Patterns](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#API-&-Communication-Patterns)

## Dev Agent Record

### Agent Model Used

Antigravity (Gemini 2.0 Flash)

### Debug Log References

### Completion Notes List

- Implemented `gameSettingsSchema` with refined validation for min/max players.
- Created secure `PATCH /api/games/[gameId]` endpoint.
- Implemented `GameSettingsForm` with client-side validation using `shadcn/ui` components.
- Integrated settings form into Game Config page.
- Added `sonner` for toast notifications.
- Verified schema logic with unit tests (`validation.test.ts`).

### Code Review Findings (Auto-Fixed)

- **Medium**: Fixed unsafe error handling in `GameSettingsForm.tsx`.
- **Medium**: Addressed API partial update limitation by strict schema validation.
- **Low**: Extracted magic numbers to `constants.ts`.

### File List

- src/features/game/lib/validation.ts
- src/features/game/lib/validation.test.ts
- src/app/api/games/[gameId]/route.ts
- src/features/game/components/GameSettingsForm.tsx
- src/app/dashboard/game/[gameId]/config/page.tsx
- src/components/ui/radio-group.tsx
- src/components/ui/sonner.tsx
- src/features/game/lib/constants.ts
