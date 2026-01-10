# Story 7.2: User Documentation (Host & Player Guides)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **new user**,
I want **to access comprehensive documentation on how to host or play Tambola**,
so that **I can participate confidently without external help**.

## Acceptance Criteria

1. **Given** I navigate to `/docs`
   **When** the page loads
   **Then** I see a welcoming landing page with two clear paths: "Host Guide" and "Player Guide"
   **And** a sidebar navigation shows all documentation sections

2. **Given** I am a host looking for help
   **When** I click on "Host Guide"
   **Then** I see documentation covering:

   - How to create a game
   - Customization options (patterns, points, intervals, player limits)
   - Managing gameplay (starting, drawing numbers)
   - Handling claims and ending games
     **And** the content is clear, scannable, and beginner-friendly

3. **Given** I am a player looking for help
   **When** I click on "Player Guide"
   **Then** I see documentation covering:

   - How to join a game (via code or link)
   - Understanding your ticket (3x9 grid explanation)
   - All prize patterns with visual examples
   - How to mark numbers and claim prizes
   - Game rules and tips for winning
     **And** pattern visualizations show the actual Tambola grid with highlighted patterns

4. **Given** I am on any documentation page
   **When** I view the page
   **Then** I see a consistent layout with:

   - Left sidebar for navigation (Host/Player sections with sub-items)
   - Main content area with clean typography
   - Responsive design (collapsible sidebar on mobile)
     **And** the documentation uses a light theme for readability

5. **Given** the documentation is deployed
   **When** the site is built
   **Then** all documentation pages are statically generated at build time for performance

6. **Given** I am not logged in
   **When** I navigate to `/docs` or any documentation page
   **Then** I can access the documentation without requiring authentication

## Tasks / Subtasks

- [x] Task 1: Create Docs Route Group Structure (AC: #1, #4, #5, #6)

  - [x] Create `src/app/(docs)/layout.tsx` with sidebar + content layout
  - [x] Create `src/app/(docs)/docs/page.tsx` as landing page with Host/Player paths
  - [x] Implement responsive sidebar (collapsible on mobile using sheet)
  - [x] Ensure static generation (no dynamic data, no auth required)
  - [x] Add proper metadata with OpenGraph for docs pages

- [x] Task 2: Create Documentation Sidebar Component (AC: #4)

  - [x] Create `src/app/(docs)/_components/DocsSidebar.tsx`
  - [x] Create `src/app/(docs)/_components/MobileSidebar.tsx` (sheet-based for mobile)
  - [x] Define navigation structure: Host Guide, Player Guide with sub-sections
  - [x] Highlight current page in sidebar
  - [x] Use existing shadcn components (Sheet, Button, ScrollArea)

- [x] Task 3: Create Documentation Landing Page (AC: #1, #6)

  - [x] Create welcoming hero section with title and description
  - [x] Add two prominent card links: "Host Guide" and "Player Guide"
  - [x] Include icons for visual appeal (Users, BookOpen from lucide-react)
  - [x] Ensure mobile-friendly layout with responsive cards

- [x] Task 4: Create Host Guide Page (AC: #2)

  - [x] Create `src/app/(docs)/docs/host/page.tsx`
  - [x] Add section: "Getting Started" - account creation, dashboard overview
  - [x] Add section: "Creating a Game" - step-by-step with descriptions
  - [x] Add section: "Customizing Your Game" - patterns, points, intervals, limits
  - [x] Add section: "Sharing Your Game" - game code, shareable link
  - [x] Add section: "Managing Gameplay" - starting, monitoring, handling claims
  - [x] Add section: "Game Completion" - results, leaderboard
  - [x] Use proper heading hierarchy (h1, h2, h3) for accessibility

- [x] Task 5: Create Player Guide Page (AC: #3)

  - [x] Create `src/app/(docs)/docs/player/page.tsx`
  - [x] Add section: "Joining a Game" - via link, via code (/join page)
  - [x] Add section: "Understanding Your Ticket" - 3x9 grid, 15 numbers, column ranges
  - [x] Add section: "Prize Patterns" - visual examples with PatternVisual component
  - [x] Add section: "Marking Numbers" - how to mark, manual tracking
  - [x] Add section: "Making Claims" - when to claim, pattern selection
  - [x] Add section: "Winning Tips" - strategy, staying alert
  - [x] Create `PatternVisual` component for pattern visualizations

- [x] Task 6: Create PatternVisual Component (AC: #3)

  - [x] Create `src/app/(docs)/_components/PatternVisual.tsx`
  - [x] Display 3x9 grid showing which cells apply to each pattern
  - [x] Show highlighted cells for each pattern type
  - [x] Include pattern name and description
  - [x] Make component reusable for all 6 patterns

- [x] Task 7: Documentation Styling and Polish (AC: #4)

  - [x] Used existing Tailwind classes for light theme styling
  - [x] Ensure light theme with good contrast for readability
  - [x] Add proper spacing, typography for long-form content
  - [x] Test responsive breakpoints (mobile, tablet, desktop)

- [x] Task 8: Unit Tests (AC: #1-6)
  - [x] Test docs landing page renders with both guide links
  - [x] Test Host Guide page renders all sections
  - [x] Test Player Guide page renders all sections
  - [x] Test PatternVisual component renders correctly for each pattern
  - [x] Test DocsSidebar navigation links
  - [x] Total: 26 tests passing

## Dev Notes

### Key Implementation Insight

This story creates a **self-service documentation system** using Next.js route groups. The `(docs)` route group allows a custom layout while keeping clean URLs (`/docs`, `/docs/host`, `/docs/player`).

**Important:** Documentation pages must be:

1. **Statically generated** - No dynamic data fetching
2. **Publicly accessible** - No authentication required
3. **Light themed** - Optimized for readability (dark mode deferred to Story 7.3)

### Route Structure

```
src/app/(docs)/
├── layout.tsx              # Docs layout with sidebar
├── docs/
│   ├── page.tsx            # Landing page at /docs
│   ├── host/
│   │   └── page.tsx        # Host guide at /docs/host
│   └── player/
│       └── page.tsx        # Player guide at /docs/player
└── _components/
    ├── DocsSidebar.tsx     # Desktop sidebar
    ├── MobileSidebar.tsx   # Mobile sheet sidebar
    └── PatternVisual.tsx   # Pattern visualization component
```

### Docs Layout Component Pattern

```typescript
// src/app/(docs)/layout.tsx
import type { Metadata } from "next";
import { DocsSidebar } from "./_components/DocsSidebar";
import { MobileSidebar } from "./_components/MobileSidebar";

export const metadata: Metadata = {
  title: {
    template: "%s | Tambola Docs",
    default: "Documentation | Tambola",
  },
  description:
    "Learn how to host and play Tambola games with our comprehensive guides.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header with Menu Button */}
      <header className="sticky top-0 z-40 lg:hidden border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center px-4">
          <MobileSidebar />
          <span className="ml-4 font-semibold">Tambola Docs</span>
        </div>
      </header>

      <div className="container flex gap-8 py-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-8">
            <DocsSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 max-w-4xl">{children}</main>
      </div>
    </div>
  );
}
```

### Sidebar Navigation Structure

```typescript
// Navigation items for DocsSidebar
const docsNavigation = [
  {
    title: "Getting Started",
    items: [{ title: "Introduction", href: "/docs" }],
  },
  {
    title: "Host Guide",
    items: [
      { title: "Overview", href: "/docs/host" },
      {
        title: "Creating a Game",
        href: "/docs/host#creating-a-game",
      },
      {
        title: "Customizing Options",
        href: "/docs/host#customization",
      },
      { title: "Sharing Your Game", href: "/docs/host#sharing" },
      { title: "Managing Gameplay", href: "/docs/host#managing" },
    ],
  },
  {
    title: "Player Guide",
    items: [
      { title: "Overview", href: "/docs/player" },
      { title: "Joining a Game", href: "/docs/player#joining" },
      {
        title: "Understanding Your Ticket",
        href: "/docs/player#ticket",
      },
      { title: "Prize Patterns", href: "/docs/player#patterns" },
      { title: "Making Claims", href: "/docs/player#claims" },
    ],
  },
];
```

### PatternVisual Component Pattern

```typescript
// src/app/(docs)/_components/PatternVisual.tsx
import { cn } from "@/lib/utils";

interface PatternVisualProps {
  pattern:
    | "TOP_ROW"
    | "MIDDLE_ROW"
    | "BOTTOM_ROW"
    | "EARLY_FIVE"
    | "FOUR_CORNERS"
    | "FULL_HOUSE";
  title: string;
  description: string;
}

// Define which cells are highlighted for each pattern
const PATTERN_CELLS: Record<
  PatternVisualProps["pattern"],
  number[][]
> = {
  TOP_ROW: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  MIDDLE_ROW: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  BOTTOM_ROW: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  EARLY_FIVE: [
    [1, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
  ], // Example cells
  FOUR_CORNERS: [
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
  ],
  FULL_HOUSE: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
};

export function PatternVisual({
  pattern,
  title,
  description,
}: PatternVisualProps) {
  const cells = PATTERN_CELLS[pattern];

  return (
    <div className="border rounded-lg p-4 bg-card">
      <h4 className="font-semibold text-lg mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>

      <div className="grid grid-rows-3 gap-1 max-w-xs">
        {cells.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-9 gap-1">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "aspect-square rounded-sm border text-xs flex items-center justify-center",
                  cell === 1
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 border-border"
                )}
              >
                {cell === 1 ? "●" : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Project Structure Notes

**Files to Create:**

- `src/app/(docs)/layout.tsx` - Docs layout with responsive sidebar
- `src/app/(docs)/docs/page.tsx` - Documentation landing page
- `src/app/(docs)/docs/host/page.tsx` - Host guide content
- `src/app/(docs)/docs/player/page.tsx` - Player guide content
- `src/app/(docs)/_components/DocsSidebar.tsx` - Desktop sidebar
- `src/app/(docs)/_components/MobileSidebar.tsx` - Mobile sidebar (Sheet-based)
- `src/app/(docs)/_components/PatternVisual.tsx` - Pattern visualization

**Existing Files to Reuse (No Modification):**

- `src/features/game/types/claims.ts` - Pattern definitions (PATTERN_DISPLAY_INFO)
- `src/components/ui/card.tsx` - shadcn Card component
- `src/components/ui/button.tsx` - shadcn Button component
- `src/components/ui/sheet.tsx` - shadcn Sheet for mobile sidebar
- `src/components/ui/scroll-area.tsx` - shadcn ScrollArea for sidebar

**Existing Patterns to Follow:**

- Use existing shadcn components for UI consistency
- Follow camelCase for all TypeScript/JSON
- Use `cn()` utility for conditional classNames
- Static generation via default Next.js behavior

### Content Guidelines for Documentation

**Host Guide Content Structure:**

1. **Getting Started**

   - Create an account (link to signup)
   - Navigate to dashboard

2. **Creating a Game**

   - Click "Create Game" button
   - Enter game title
   - Configure options (explained below)

3. **Customizing Your Game**

   - Prize Patterns: Select which patterns are enabled
   - Point Values: Set 1st/2nd/3rd place points for each pattern
   - Number Interval: 7s (fast), 10s (normal), 15s (relaxed)
   - Player Limits: Min 2, Max 75 players

4. **Sharing Your Game**

   - Copy shareable link
   - Share 6-digit game code
   - Players can use /join page with code

5. **Managing Gameplay**

   - Wait in lobby until minimum players join
   - Click "Start Game" when ready
   - Numbers are called automatically
   - Monitor leaderboard for claims

6. **Game Completion**
   - Game ends when Full House is claimed
   - All players see final leaderboard
   - Results are saved to game history

**Player Guide Content Structure:**

1. **Joining a Game**

   - Via direct link from host
   - Via /join page with 6-digit code
   - Enter nickname to join

2. **Understanding Your Ticket**

   - 3 rows × 9 columns grid
   - Each row has exactly 5 numbers
   - 15 numbers total per ticket
   - Column order: 1-9, 10-19, ..., 80-90

3. **Prize Patterns**

   - Early Five: First 5 numbers marked
   - Top Row: All 5 numbers in first row
   - Middle Row: All 5 numbers in middle row
   - Bottom Row: All 5 numbers in bottom row
   - Four Corners: First and last of top and bottom rows
   - Full House: All 15 numbers (ends the game!)

4. **Marking Numbers**

   - Tap/click number on ticket when called
   - Numbers turn highlighted when marked
   - You must mark manually - no auto-marking!

5. **Making Claims**

   - Click "Claim" button when you complete a pattern
   - Select which pattern you're claiming
   - System verifies automatically
   - Invalid claims show an error - try again!

6. **Tips for Winning**
   - Keep eyes on your ticket and called numbers
   - Check history bar if you missed a number
   - Claim quickly - first come, first served!
   - Watch for multiple pattern opportunities

### Architecture Compliance

**Performance (Static Generation):**

- All documentation pages use static generation
- No database queries or API calls
- Optimal for fast page loads (NFR3: <3s page load)

**Accessibility:**

- Proper heading hierarchy (h1 > h2 > h3)
- Semantic HTML for screen readers
- Skip-to-content for keyboard navigation
- Sufficient color contrast for light theme

**Security:**

- No authentication required for docs
- No sensitive data exposed
- Public content by design

### References

- [Epics: Story 7.2 - User Documentation](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-7.2:-User-Documentation-Host--Player-Guides)
- [Story 7.1 - Join Page Implementation](file:///Users/mac/Desktop/femil/tambola/_bmad-output/implementation-artifacts/7-1-join-page-with-game-code-entry.md)
- [Pattern Display Info](file:///Users/mac/Desktop/femil/tambola/src/features/game/types/claims.ts#L40-L68)
- [Ticket Component Pattern](file:///Users/mac/Desktop/femil/tambola/src/features/game/components/Ticket.tsx)
- [Architecture: Project Structure](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#Project-Structure--Boundaries)
- [Project Context: Naming Conventions](file:///Users/mac/Desktop/femil/tambola/_bmad-output/project-context.md#Naming-Conventions)

### Previous Story Intelligence (Story 7.1)

**Key Learnings:**

- Route group pattern works well for custom layouts
- Client components use `useState` for interactive elements
- shadcn components provide consistent styling
- Mobile-first design is expected
- Toast notifications using sonner for feedback
- Auto-focus pattern for inputs

### Git Intelligence

**Recent Commits:**

- Epic 6 completed with game history features
- UI/UX patterns established for cards, lists, forms
- Testing patterns established with Vitest

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
