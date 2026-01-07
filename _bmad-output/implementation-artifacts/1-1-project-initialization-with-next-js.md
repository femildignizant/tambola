---
story_key: "1-1-project-initialization-with-next-js"
epic_id: "1"
status: "done"
date: "2026-01-06"
---

# Story 1.1: Project Initialization with Next.js

## Story Foundation

### User Story

**As a** developer,
**I want** a properly initialized Next.js project with all foundational dependencies,
**So that** I have a working codebase to build upon.

### Acceptance Criteria

- [x] **Next.js 16+ Project Created**: Project initialized with TypeScript, Tailwind CSS, ESLint, App Router, and `src/` directory.
- [x] **shadcn/ui Initialized**: Configured with `components.json` and default theme (New York style, Slate base color).
- [x] **Folder Structure Implemented**: Feature-based structure (`src/features/`, `src/lib/`, `src/components/`, `src/types/`) created matching Architecture.
- [x] **Prisma & NeonDB Configured**: `prisma/schema.prisma` created and configured for PostgreSQL (NeonDB).
- [x] **Core Utilities Scaffolded**: Empty/placeholder files created for:
  - `src/lib/auth.ts` (BetterAuth)
  - `src/lib/pusher-client.ts`
  - `src/lib/pusher-server.ts`
  - `src/lib/redis.ts` (Upstash)
  - `src/lib/prisma.ts` (Singleton pattern)
- [x] **Development Server Runs**: `npm run dev` starts without errors at `http://localhost:3000`.

### Context & Business Value

This is the foundational story for the entire Tambola project. A solid, well-structured setup here prevents technical debt and ensures all future stories (Auth, Game Logic, Real-time features) have a reliable consistent base to build upon. We are adhering to a "Feature-based" architecture to keep related code together as the application grows.

---

## Developer Context

### Technical Stack & Versions

- **Framework**: Next.js 16.x (App Router)
- **Language**: TypeScript 5.x ("strict": true)
- **Styling**: Tailwind CSS 3.x or 4.x (via create-next-app)
- **UI Components**: shadcn/ui (Latest)
- **Database**: NeonDB (Postgres 15+) via Prisma ORM
- **Authentication**: BetterAuth (Latest)
- **Real-time**: Pusher JS (Latest)
- **State/Cache**: Upstash Redis (Latest)

### Architecture Compliance

**Strict Enforcement Required:**

1.  **Project Structure**: MUST use `src/` directory.
2.  **App Router**: MUST use `src/app`. NO `pages/` router.
3.  **Naming Conventions**:
    - Files: `kebab-case.ts`
    - Components: `PascalCase.tsx`
    - Functions/Variables: `camelCase`
4.  **Import Aliases**: MUST confirm `@/*` maps to `./src/*` in `tsconfig.json`.

---

## Implementation Guide

### Step 1: Initialize Next.js Project

Run the initialization command. Ensure you are in the parent directory of where `tambola` should be, or if staying in current root, adjust accordingly.
**Command:**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

_(Note: If project folder already exists and is empty, use `.` . If creating new folder, replace `.` with `tambola`)_

### Step 2: Install Core Dependencies

Install the required libraries for our stack.

```bash
npm install better-auth @prisma/client prisma pusher pusher-js @upstash/redis zustand clsx tailwind-merge lucide-react
npm install -D @types/node @types/react @types/react-dom
```

### Step 3: Initialize shadcn/ui

Run the shadcn init command.

```bash
npx shadcn@latest init
```

**Configuration Choices:**

- Style: **New York**
- Base Color: **Slate**
- CSS Variables: **Yes**

### Step 4: Create Feature-Based Folder Structure

Create the following directory tree inside `src/`:

```bash
mkdir -p src/features/auth/components src/features/auth/hooks
mkdir -p src/features/game/components src/features/game/hooks src/features/game/lib
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/utils
```

### Step 5: Scaffold Utility Files

Create these files with basic content to satisfy the architecture requirements.

**1. `src/lib/prisma.ts`**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma;
```

**2. `src/lib/utils.ts` (shadcn usually creates this, verify it exists)**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**3. `src/lib/auth.ts`**

```typescript
// Placeholder for BetterAuth configuration
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Additional config to be added in Story 1.2
});
```

**4. `src/lib/redis.ts`**

```typescript
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});
```

**5. `src/lib/pusher-client.ts`**

```typescript
import Pusher from "pusher-js";

export const pusherClient = new Pusher(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);
```

**6. `src/lib/pusher-server.ts`**

```typescript
import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});
```

### Step 6: Configure Environment

Create `.env.local` (do not commit real secrets).

```env
# Database
DATABASE_URL=""

# Auth
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"

# Pusher
NEXT_PUBLIC_PUSHER_KEY=""
NEXT_PUBLIC_PUSHER_CLUSTER=""
PUSHER_APP_ID=""
PUSHER_SECRET=""

# Upstash Redis
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

### Step 7: Verify Installation

Run `npm run dev` and ensure the welcome page loads at `http://localhost:3000`.

---

## Definition of Done

- [x] Project builds successfully (`npm run build`).
- [x] Folder structure matches the Architecture/Story requirements.
- [x] All foundational libraries are installed.
- [x] `npm run dev` starts the server cleanly.

## Dev Agent Record

### Implementation Notes

- Initialized Next.js 16 app in place.
- Configured shadcn/ui with matching settings.
- Scaffolded utility files and created directory structure.
- Addressed Prisma 7 configuration (removed `url` from `datasource`, `output` set to `.prisma/client`).
- Added `@ts-expect-error` to `src/lib/prisma.ts` to workaround type import issue with Prisma 7 + Next.js setup.
- Added explicit null checks for Pusher environment variables to satisfy linting.
- Verified build and file structure.
- **AI Review Fix:** Scaffolded empty `tests/` directory structure (`tests/features`, `tests/e2e`) to match Architecture requirements.
- **AI Review Fix:** Updated File List to include all configuration files.

### Change Log

- Initialized Project
- Created `src/lib/*.ts` utilities
- Configured `prisma/schema.prisma`
- Created `.env.local`
- Scaffolded `tests/` directory structure

## File List

- src/lib/prisma.ts
- src/lib/auth.ts
- src/lib/redis.ts
- src/lib/pusher-client.ts
- src/lib/pusher-server.ts
- src/lib/utils.ts
- prisma/schema.prisma
- .env.local
- components.json
- package.json
- prisma.config.ts
- tsconfig.json
- next.config.ts
- postcss.config.mjs
- eslint.config.mjs
- tests/
