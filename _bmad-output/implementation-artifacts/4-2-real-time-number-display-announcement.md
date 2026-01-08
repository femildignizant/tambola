# Story 4.2: Real-time Number Display & Announcement

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **player**,
I want **to see and hear the number as soon as it's called**,
so that **I can check my ticket**.

## Acceptance Criteria

1. **Given** I am on the `/play` screen
   **When** a `number:called` event arrives
   **Then** the large number display updates with a specialized animation (e.g., pop/scale)
   **And** the text-to-speech audio announces "Four Two. Forty Two." (Digit-by-digit then full number)
   **And** the number is added to the "Last called" history bar

2. **Given** I want to play quietly
   **When** I toggle the Mute button
   **Then** the audio announcements stop but visual updates continue
   **And** the mute preference is persisted (local storage or session)

3. **Given** play is in progress
   **When** a number is called
   **Then** it appears in the "Last 10 Numbers" history bar (most recent on left/top)
   **And** older numbers shift out

4. **Given** I join a game in progress
   **When** the page loads
   **Then** I see the current number and the last 10 called numbers correctly populated from game state

## Tasks / Subtasks

- [x] Create Number Display Component (AC: 1)

  - [x] Create `src/features/game/components/NumberDisplay.tsx`
  - [x] Implement large text display for current number
  - [x] Add "pop" animation using `tailwindcss-animate` or CSS keyframes on number change
  - [x] Display "Waiting..." or similar state when no number called yet

- [x] Implement Text-to-Speech Announcement (AC: 1, 2)

  - [x] Create `src/features/game/hooks/useNumberAnnouncer.ts` hook
  - [x] Use `window.speechSynthesis` API
  - [x] Implement "Digit-by-digit then full number" logic (e.g., "4... 2... Forty Two")
  - [x] Handle browser support and voice selection (prefer English female voice if available)
  - [x] Integrate with Mute state

- [x] Create Number History Component (AC: 3, 4)

  - [x] Create `src/features/game/components/NumberHistory.tsx`
  - [x] Display last 10 numbers from `calledNumbers` array
  - [x] Style as a horizontal scrolling bar or distinct row
  - [x] Highlight the most recent number distinctively

- [x] Implement Mute Toggle (AC: 2)

  - [x] Add Mute/Unmute button to `PlayPageClient` or `NumberDisplay`
  - [x] Persist preference to `localStorage` (key: `tambola-mute-preference`)
  - [x] Sync with `useNumberAnnouncer`

- [x] Integrate Components into Play Page (AC: 1, 4)

  - [x] Update `src/features/game/components/PlayPageClient.tsx`
  - [x] Replace placeholder display with `NumberDisplay` and `NumberHistory`
  - [x] Ensure `calledNumbers` from store are passed correctly

- [x] Write Tests (AC: 1, 2, 3)
  - [x] Unit tests for `NumberDisplay` (rendering, animation class)
  - [x] Unit tests for `NumberHistory` (correct slicing of numbers)
  - [x] Unit/Integration tests for `useNumberAnnouncer` (mock `speechSynthesis`)

## Dev Notes

### Critical Context from Story 4.1

**Story 4.1 implemented:**

- The game loop and `number:called` Pusher event.
- `PlayPageClient.tsx` with Pusher subscription.
- `useGameStore` with `calledNumbers` and `currentNumber`.
- **Note:** `PlayPageClient` currently has a placeholder display. You will replace this.

### Implementation Details

**Text-to-Speech (TTS) Logic:**

- The requirement is specific: "Four Two. Forty Two."
- Logic:
  - If number < 10: Just say the number (e.g., "Five")
  - If number >= 10: Say first digit, second digit, then full number.
  - Example 42: "Four. Two. Forty Two."
- **Browser Compatibility:** `window.speechSynthesis` is widely supported but requires user interaction (click) before first play in some browsers. Since the user likely clicked "Join" or "Start", this might be covered, but handle `not-allowed` errors gracefully.

**Animation:**

- Use `tailwindcss-animate` (standard in shadcn/ui) if available, or standard CSS transitions.
- Keyframe example: `animate-in zoom-in-50 duration-300` when number changes.
- You may need a `key` prop on the number text element to trigger animation on change: `<span key={currentNumber} className="animate-pop">...</span>`

**State Management:**

- `useGameStore` already holds the data.
- `NumberHistory` should derive the last 10 numbers: `calledNumbers.slice(-10).reverse()` (assuming we want newest first).

### Architecture Compliance

- **Components:** Place in `src/features/game/components/`.
- **Hooks:** Place in `src/features/game/hooks/`.
- **Naming:** PascalCase for components (`NumberDisplay`), camelCase for hooks (`useNumberAnnouncer`).
- **Performance:** `NumberHistory` should use `useShallow` or specific selectors to avoid re-renders if the full `calledNumbers` array is large (though 90 is small enough).

### References

- [Epics: Story 4.2](file:///home/digni/Documents/Projects/tambola/_bmad-output/planning-artifacts/epics.md#Story-4.2:-Real-time-Number-Display-&-Announcement)
- [Architecture: Frontend Architecture](file:///home/digni/Documents/Projects/tambola/_bmad-output/planning-artifacts/architecture.md#Frontend-Architecture)
- [Project Context: UX Requirements](file:///home/digni/Documents/Projects/tambola/_bmad-output/project-context.md#UX-Requirements)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- Fixed `ReferenceError: SpeechSynthesisUtterance is not defined` in `useNumberAnnouncer.test.ts` by mocking the browser global.

### Completion Notes List

- Implemented `NumberDisplay` component with "pop" animation.
- Implemented `NumberHistory` component showing last 10 numbers.
- Implemented `useNumberAnnouncer` hook for TTS with "Digit-by-digit then full number" logic.
- Integrated all components into `PlayPageClient`.
- Added Mute toggle with persistence to `localStorage`.
- Added comprehensive unit tests for all new components and hooks.
- Verified all Acceptance Criteria.

### File List

- `src/features/game/components/NumberDisplay.tsx`
- `src/features/game/components/NumberDisplay.test.tsx`
- `src/features/game/components/NumberHistory.tsx`
- `src/features/game/components/NumberHistory.test.tsx`
- `src/features/game/hooks/useNumberAnnouncer.ts`
- `src/features/game/hooks/useNumberAnnouncer.test.ts`
- `src/features/game/components/PlayPageClient.tsx`
