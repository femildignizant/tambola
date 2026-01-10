# Story 7.1: Join Page with Game Code Entry

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **player**,
I want **to enter a game code on a dedicated join page**,
so that **I can quickly join a friend's Tambola game without needing a direct link**.

## Acceptance Criteria

1. **Given** I click "Join a Game" from the landing page
   **When** I am redirected to `/join`
   **Then** I see a centered input field for a 6-character game code
   **And** the page is mobile-optimized and responsive

2. **Given** I enter a valid 6-character game code that exists
   **When** I submit the form
   **Then** the system validates the code against existing games
   **And** if valid, I am redirected to the game lobby at `/game/[gameId]`

3. **Given** I enter an invalid or non-existent code
   **When** I submit the form
   **Then** I see a clear error message: "Game not found. Check your code and try again."
   **And** the input field is not cleared so I can correct the code

4. **Given** I enter a code for a game that has already started
   **When** I submit the form
   **Then** I see an error message: "This game has already started. You cannot join now."

5. **Given** I enter a code for a game that is full
   **When** I submit the form
   **Then** I see an error message: "This game is full."

6. **Given** I enter a code for a completed game
   **When** I submit the form
   **Then** I see an error message: "This game has already ended."

7. **Given** I am on the join page
   **When** I view the input field
   **Then** the input auto-focuses on page load
   **And** accepts alphanumeric characters (case-insensitive)
   **And** limits input to 6 characters maximum
   **And** shows character count or visual progress (optional enhancement)

## Tasks / Subtasks

- [x] Task 1: Create API Endpoint for Code Lookup (AC: #2, #3, #4, #5, #6)

  - [x] Create `/api/games/lookup/route.ts` POST endpoint
  - [x] Accept `{ code: string }` in request body
  - [x] Query game by `gameCode` (case-insensitive comparison)
  - [x] Return `{ data: { gameId, title, status, playerCount, maxPlayers } }` on success
  - [x] Return appropriate error messages for each failure case
  - [x] Add Zod validation for code format (6 alphanumeric chars)

- [x] Task 2: Create Join Page Server Component (AC: #1)

  - [x] Create `/src/app/join/page.tsx` as server component
  - [x] Add page metadata (title: "Join a Game | Tambola")
  - [x] Simple layout with centered content
  - [x] Import and render JoinForm client component

- [x] Task 3: Create JoinForm Client Component (AC: #1, #2, #3, #4, #5, #6, #7)

  - [x] Create `/src/app/join/_components/JoinForm.tsx` as client component
  - [x] Implement controlled input for game code
  - [x] Auto-focus input on mount using useRef
  - [x] Auto-uppercase input for consistency
  - [x] Limit input to 6 characters
  - [x] Handle form submission with loading state
  - [x] Call `/api/games/lookup` to validate code
  - [x] Display error messages using toast or inline error
  - [x] Redirect to `/game/[gameId]` on success using router.push()

- [x] Task 4: Add Validation and Error Handling (AC: #3, #4, #5, #6)

  - [x] Map API error responses to user-friendly messages
  - [x] Handle network errors gracefully
  - [x] Prevent multiple submissions (disable button while loading)
  - [x] Clear error on new input

- [x] Task 5: Mobile-First Responsive Design (AC: #1)

  - [x] Center form vertically and horizontally on all screen sizes
  - [x] Large touch-friendly input and button on mobile
  - [x] Appropriate padding and sizing for small screens
  - [x] Use existing design tokens from globals.css

- [x] Task 6: Unit Tests (AC: #2-6)
  - [x] Test API lookup returns correct gameId for valid code
  - [x] Test API returns 404 for non-existent code
  - [x] Test API returns 400 for started game
  - [x] Test API returns 400 for full game
  - [x] Test API returns 400 for completed game
  - [x] Test input validation (6 char limit, alphanumeric only)

## Dev Notes

### Key Implementation Insight

This story creates a **code-to-gameId lookup** flow. The existing join API (`/api/games/[gameId]/join`) already handles the actual joining logic. This story only creates:

1. A lookup API to convert code → gameId
2. A UI for entering the code

The redirect goes to `/game/[gameId]`, which is the existing lobby page that handles nickname entry and the actual join.

### API Endpoint Design

**File**: `src/app/api/games/lookup/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const lookupSchema = z.object({
  code: z
    .string()
    .length(6)
    .regex(/^[A-Z0-9]+$/i, "Code must be alphanumeric"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = lookupSchema.parse(body);

    const game = await prisma.game.findFirst({
      where: {
        gameCode: { equals: code, mode: "insensitive" },
      },
      include: {
        _count: { select: { players: true } },
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found. Check your code and try again." },
        { status: 404 }
      );
    }

    if (game.status === "COMPLETED") {
      return NextResponse.json(
        { error: "This game has already ended." },
        { status: 400 }
      );
    }

    if (game.status === "STARTED") {
      return NextResponse.json(
        {
          error:
            "This game has already started. You cannot join now.",
        },
        { status: 400 }
      );
    }

    if (game._count.players >= game.maxPlayers) {
      return NextResponse.json(
        { error: "This game is full." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: {
        gameId: game.id,
        title: game.title,
        status: game.status,
        playerCount: game._count.players,
        maxPlayers: game.maxPlayers,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid code format" },
        { status: 400 }
      );
    }
    console.error("Lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Component Structure

```
src/app/join/
├── page.tsx           # Server component with metadata
└── _components/
    └── JoinForm.tsx   # Client component with form logic
```

### JoinForm Component Pattern

```typescript
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function JoinForm() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/games/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      router.push(`/game/${data.data.gameId}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 w-full max-w-sm"
    >
      <Input
        ref={inputRef}
        value={code}
        onChange={(e) =>
          setCode(e.target.value.toUpperCase().slice(0, 6))
        }
        placeholder="Enter 6-digit code"
        className="text-center text-2xl tracking-widest"
        maxLength={6}
        disabled={isLoading}
      />
      <Button
        type="submit"
        className="w-full"
        disabled={code.length !== 6 || isLoading}
      >
        {isLoading ? "Joining..." : "Join Game"}
      </Button>
    </form>
  );
}
```

### Project Structure Notes

**Files to Create:**

- `src/app/api/games/lookup/route.ts` - Code lookup API endpoint
- `src/app/api/games/lookup/route.test.ts` - API unit tests
- `src/app/join/page.tsx` - Join page server component
- `src/app/join/_components/JoinForm.tsx` - Join form client component

**Existing Files to Reuse (No Modification):**

- `src/app/page.tsx` - Landing page already links to `/join`
- `src/app/api/games/[gameId]/join/route.ts` - Existing join logic (used after redirect)
- `src/components/ui/input.tsx` - shadcn input component
- `src/components/ui/button.tsx` - shadcn button component

**Existing Patterns to Follow:**

- API response format: `{ data: T }` or `{ error: string }`
- Toast notifications using `sonner`
- Loading states with `isLoading` boolean
- Form validation with Zod on API

### Database Query Note

The `gameCode` field in the Game model is already indexed (`@@index([gameCode])`), so lookups will be efficient. Use case-insensitive comparison since codes are user-entered.

### References

- [Epics: Story 7.1 - Join Page with Game Code Entry](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-7.1:-Join-Page-with-Game-Code-Entry)
- [Landing Page with Join Link](file:///Users/mac/Desktop/femil/tambola/src/app/page.tsx) - Line 44-48
- [Existing Join API](file:///Users/mac/Desktop/femil/tambola/src/app/api/games/[gameId]/join/route.ts) - Reference for error handling patterns
- [Game Model with gameCode](file:///Users/mac/Desktop/femil/tambola/prisma/schema.prisma#L104) - gameCode field definition
- [Project Context: API Format](file:///Users/mac/Desktop/femil/tambola/_bmad-output/project-context.md#API-Response-Format)
- [Project Context: Naming Conventions](file:///Users/mac/Desktop/femil/tambola/_bmad-output/project-context.md#Naming-Conventions)

### Previous Story Intelligence (Story 6.3)

**Key Learnings:**

- Toast notifications using sonner work well for user feedback
- Client components use `useState` for loading/error states
- API routes return `{ data }` or `{ error }` format consistently
- Mobile-first design is expected

### Architecture Compliance

**Performance:**

- Indexed lookup on `gameCode` for fast queries
- Single API call to validate before redirect
- No unnecessary data loading

**Security:**

- Server-side validation of game status
- No sensitive data exposed in lookup response
- Rate limiting could be added later if needed

**UX (NFR4: Interaction response < 100ms):**

- Auto-focus for immediate typing
- Loading state feedback
- Clear error messages
- No page refresh on error

## Dev Agent Record

### Agent Model Used

Antigravity (Claude)

### Debug Log References

- Build successful: All TypeScript compiles without errors
- Test run: 137 tests pass (8 new tests for lookup API)

### Completion Notes List

1. ✅ Created `/api/games/lookup` POST endpoint with Zod validation for 6-character alphanumeric codes
2. ✅ Implemented case-insensitive game code lookup using Prisma `mode: "insensitive"`
3. ✅ Added proper error responses for all failure scenarios (404, 400 for started/full/completed)
4. ✅ Created Join Page at `/join` with server component and metadata
5. ✅ Implemented JoinForm client component with:
   - Auto-focus on mount using useRef
   - Auto-uppercase input with alphanumeric filtering
   - Character count display (X/6)
   - Loading state with button disabled during fetch
   - Toast notifications for error feedback
   - Redirect to `/game/[gameId]` on success
6. ✅ Mobile-first responsive design with centered layout
7. ✅ All 8 unit tests for lookup API pass
8. ✅ Full regression suite passes (151 tests after code review fixes)

### File List

**New Files:**

- `src/app/api/games/lookup/route.ts` - Game code lookup API endpoint
- `src/app/api/games/lookup/route.test.ts` - Unit tests for lookup API
- `src/app/join/page.tsx` - Join Page server component
- `src/app/join/_components/JoinForm.tsx` - Join form client component
- `src/app/join/_components/JoinForm.test.tsx` - Unit tests for JoinForm component (14 tests)

**Modified Files:**

- `_bmad-output/implementation-artifacts/sprint-status.yaml` - Status updated
- `_bmad-output/planning-artifacts/epics.md` - Epic 7 story definitions

## Senior Developer Review (AI)

**Review Date:** 2026-01-10
**Review Outcome:** Approved with fixes applied

### Action Items

- [x] [MEDIUM] Add missing `epics.md` to File List - FIXED
- [x] [MEDIUM] Add client-side tests for JoinForm component - FIXED (14 tests added)
- [x] [MEDIUM] Fix potential race condition on double-tap submit - FIXED (added `isSubmitting` ref)
- [ ] [LOW] Consider structured logging instead of console.error (deferred)
- [ ] [LOW] Add error boundary for JoinForm (deferred)
- [ ] [LOW] Improve placeholder text clarity (deferred)

**Issues Fixed:** 3 MEDIUM
**Issues Deferred:** 3 LOW

## Change Log

- 2026-01-10: Implemented Story 7.1 - Join Page with Game Code Entry (all tasks complete)
- 2026-01-10: Code Review - Fixed 3 MEDIUM issues (added 14 client tests, race condition fix, updated File List)
