# Remedy Story: Epic 2 Cleanup & UX Fixes

**Context:**
Identified during the Epic 2 Retrospective, these items are critical UX/UI fixes required before proceeding to Epic 3. They address layout inconsistencies, broken navigation, and the lack of a public entry point.

**Status:** Ready for Dev

---

## Task 1: Refactor Dashboard Layout (App Shell)

**Problem:**
The "Header" and page structure are currently inside `src/app/dashboard/page.tsx`. This causes the header to disappear when navigating to sub-pages like `/dashboard/game/[id]/config` or `/dashboard/create`.

**Goal:**
Move the common layout elements into a proper Next.js Layout component.

**Acceptance Criteria:**

- [ ] Create `src/app/dashboard/layout.tsx`
- [ ] Move the `Header` (with LogoutButton and Logo) from `page.tsx` to `layout.tsx`
- [ ] Ensure the Header persists across all `/dashboard/*` routes
- [ ] `page.tsx` should only contain the "Your Games" section and GameList
- [ ] Verify `children` prop works correctly to render page content

---

## Task 2: Fix Game Manager Link

**Problem:**
The "Manage" button in `GameList.tsx` links to `/dashboard/game/[id]`, which does not exist. The correct route is `/dashboard/game/[id]/config`.

**Goal:**
Update the navigation link to point to the correct configuration page.

**Acceptance Criteria:**

- [ ] Update `src/features/game/components/GameList.tsx`
- [ ] Change `Link` href from `/dashboard/game/${game.id}` to `/dashboard/game/${game.id}/config`
- [ ] Verify clicking "Manage" correctly loads the config form

---

## Task 3: Implement Landing Page (Hero Section)

**Problem:**
The root path `/` currently renders the default Next.js starter page, which is confusing for users.

**Goal:**
Create a simple, attractive landing page that explains the app and provides entry points.

**Requirements:**

- **Hero Section:**
  - Title: "Tambola - Host Your Own Game Night"
  - Subtitle: "The easiest way to play Tambola with friends and family. Real-time number calling, digital tickets, and automated claims."
  - **Call to Actions:**
    - "Host a Game" -> Links to `/signup` (or `/login`)
    - "Join a Game" -> Links to `/join` (placeholder for Epic 3) or just focus on Host for now.
- **Design:**
  - Use Shadcn UI components (Button)
  - Clean, modern aesthetic (Tailwind)
  - Responsive alignment
- **Location:** Replace content of `src/app/page.tsx`

**Acceptance Criteria:**

- [ ] Root URL `/` shows the new Hero section
- [ ] "NEXUS" default page content is completely removed
- [ ] Navigation buttons work correctly
