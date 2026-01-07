# Story 2.3: Configure Prize Patterns

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **host**,
I want **to select which patterns are enabled and set their point values**,
so that **I can customize the prizes for my game**.

## Acceptance Criteria

1. **Given** I am on the game configuration page
   **When** I toggle patterns on/off
   **Then** the selected patterns are saved for this game
   **And** at minimum, Full House must be enabled (cannot be disabled)

2. **Given** I set point values for each pattern
   **When** I save the configuration
   **Then** each pattern has its configured point value stored

3. **Given** I configure pattern variants (1st/2nd/3rd claimer points)
   **When** I save
   **Then** the tiered point values are stored for each pattern

## Tasks / Subtasks

- [x] Define Game Pattern Validation Schema (AC: 1, 2, 3)

  - [x] Update `src/features/game/lib/validation.ts`
  - [x] Add `gamePatternSchema` validating:
    - `pattern` (Enum)
    - `points` (number, positive)
    - `name` (optional custom name?) - _Stick to standard names for MVP unless schema allows override_
    - `winningLine` (optional, for variants like 'Line 1', 'Line 2') - _Actually `GamePattern` likely links to `Pattern` enum. Variants might be handled by separate records or a `variant` field._
    - Ensure `FULL_HOUSE` is present in the list of enabled patterns.

- [x] Implement Game Pattern API (AC: 1, 2, 3)

  - [x] Create `PUT /api/games/[gameId]/patterns` (or `PATCH /api/games/[gameId]` if combined config)
    - _Rec: Use `PUT /api/games/[gameId]/patterns` to replace current patterns with new list._
  - [x] Validate `hostId` (Host ownership)
  - [x] Validate input with Zod schema
  - [x] Transaction: Delete existing `GamePattern` records for game -> Insert new ones.
  - [x] Enforce "Full House" mandatory check server-side.

- [x] Create Pattern Configuration UI (AC: 1, 2, 3)

  - [x] Create `src/features/game/components/PatternConfigForm.tsx`
  - [x] Fetch available patterns (Enum/List)
  - [x] UI: List of Patterns with Switches (Toggle On/Off)
    - Disable Toggle for "Full House" (Always On)
  - [x] UI: Input field for Points for each enabled pattern
  - [x] UI: Accordion/Expansion for Variants (e.g., Early 5 -> 2nd Early 5?)
    - _AC mentions "1st/2nd/3rd claimer points". This implies variants._
    - _UI should allow adding variants or just configuring fixed variants if they exist._
    - _Recommendation: Allow "Add Variant" or just "1st Prize", "2nd Prize" inputs if pattern supports it._
    - _Simpler MVP:_ Just list of patterns. If "First Row" can have "2nd winner", maybe that's a separate "Second Prize First Row" pattern? Or `GamePattern` has `rank`?
    - _Architecture/Epics say "pattern variants with tiered points (1st, 2nd, 3rd claimers)"._
    - _Implies `GamePattern` has fields like `allowMultipleWinners` or we create multiple records: `Pattern: FULL_HOUSE, Rank: 1`, `Pattern: FULL_HOUSE, Rank: 2`._
    - _Check `prisma/schema.prisma` from Story 2.1 if possible, else assume schema supports it or modify schema._

- [x] Integrate into Game Config Page (AC: 1)
  - [x] Upsert `src/app/dashboard/game/[gameId]/config/page.tsx`
  - [x] Fetch current game config (patterns)
  - [x] Render `PatternConfigForm`
  - [x] Handle Save/Submit

## Dev Notes

### Schema & Data Model

- **Pattern Enum:** `FIRST_ROW`, `SECOND_ROW`, `THIRD_ROW`, `EARLY_FIVE`, `FOUR_CORNERS`, `FULL_HOUSE`.
- **GamePattern Table:** Likely has `gameId`, `pattern` (Enum), `points`, `place` (or `rank`, default 1).
- **Mandatory:** `FULL_HOUSE` must always be enabled.

### API

- Endpoint: `PUT /api/games/[gameId]/patterns`
- Body: `{ patterns: [{ type: "FULL_HOUSE", points: 100, place: 1 }, { type: "EARLY_FIVE", points: 50, place: 1 }] }`
- Logic:
  - Verify Session & Host.
  - `prisma.$transaction`:
    - `deleteMany` existing patterns for game.
    - `createMany` new patterns.

### UI/UX

- Use `shadcn/ui` Switch, Input, Card.
- Group by Pattern Type.
- "Add Rank/Prize" button? Or just "1st", "2nd" inputs if strictly limited to 1st/2nd/3rd.
- _Tip: Start simple._ Toggle + Points. Only add Rank if Schema/Architecture explicitly demands refined UI for it now. AC says "Configure pattern variants (1st/2nd/3rd)". So yes, need support.

### References

- [Epics: Story 2.3](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-2.3:-Configure-Prize-Patterns)
- [Architecture: API Patterns](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#API-&-Communication-Patterns)

## Dev Agent Record

### Agent Model Used

Antigravity (Gemini 2.0 Flash)

### Completion Notes

- Implemented Zod schema for game patterns including mandatory FULL_HOUSE check.
- Added comprehensive unit test `src/features/game/lib/validation.test.ts` to verify schema rules.
- Created `PUT /api/games/[gameId]/patterns` endpoint with transaction support for atomic updates.
- Built `PatternConfigForm` using shadcn/ui components (Switch, Input, Card) and react-hook-form.
- Implemented `GameConfigPage` with server-side auth and data fetching.
- Verified validation logic via tests.

### File List

- src/features/game/lib/validation.ts
- src/features/game/lib/validation.test.ts (New)
- src/app/api/games/[gameId]/patterns/route.ts (New)
- src/features/game/components/PatternConfigForm.tsx (New)
- src/components/ui/switch.tsx (New)
- src/app/dashboard/game/[gameId]/config/page.tsx (New)

## Senior Developer Review (AI)

_Reviewer: Antigravity on 2026-01-07_

- **Status**: Approved
- **Findings**:
  - Found API logic issue where patterns could be updated during active games. Fixed by adding status check.
  - Found weak typing in UI component (`any[]`). Fixed by importing `GamePattern` from Prisma.
  - Found missing file in documentation. Added `switch.tsx` to File List.
- **Outcome**: All issues resolved. Tests passing. Story marked as done.
