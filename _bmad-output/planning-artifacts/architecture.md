---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/product-brief-tambola-2026-01-05.md"
  - "_bmad-output/project-context.md"
workflowType: "architecture"
project_name: "tambola"
user_name: "femil"
date: "2026-01-06"
status: "complete"
completedAt: "2026-01-06"
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
48 FRs across 10 categories covering the complete game lifecycle:

- User authentication and account management (4 FRs)
- Game creation with rich configuration options (8 FRs)
- Lobby management with real-time player tracking (6 FRs)
- Auto-calling number system with audio/visual feedback (5 FRs)
- Personal ticket interaction with tap-to-mark (4 FRs)
- Claim system with auto-verification (7 FRs)
- Game completion with leaderboard (3 FRs)
- Resilience features for mid-game join and reconnection (3 FRs)
- Game history for user reference (2 FRs)
- 6 supported prize patterns (6 FRs)

**Non-Functional Requirements:**

| Category        | Key Requirement                                           |
| --------------- | --------------------------------------------------------- |
| **Performance** | < 2s number broadcast, < 500ms claim resolution           |
| **Reliability** | 99% uptime during games, 100% state persistence           |
| **Security**    | Server-authoritative design, no client-trusted operations |
| **Scalability** | 75 players/game, 50+ concurrent games on free tier        |

**Scale & Complexity:**

- Primary domain: Full-stack real-time web application
- Complexity level: Low-Medium
- Estimated architectural components: 8-10 major components

### Technical Constraints & Dependencies

| Technology        | Constraint                    | Mitigation                         |
| ----------------- | ----------------------------- | ---------------------------------- |
| **Vercel**        | 30s timeout, no WebSocket     | Use Pusher for all real-time       |
| **Pusher**        | 200k msg/day, 100 connections | Batch updates, efficient messaging |
| **Upstash Redis** | 10k cmd/day                   | Efficient claim locking only       |
| **NeonDB**        | Cold starts ~500ms            | Connection pooling mandatory       |
| **BetterAuth**    | Email/password only           | No OAuth complexity for MVP        |

### Cross-Cutting Concerns Identified

1. **Real-time Synchronization** — Affects lobby, gameplay, claims, announcements
2. **Authentication/Authorization** — Host vs player permissions
3. **Error Handling** — Graceful degradation, never blank screens
4. **State Management** — Server-side authoritative, client optimistic
5. **Reconnection Logic** — State recovery across all game phases

---

## Starter Template Evaluation

### Primary Technology Domain

Full-stack real-time web application (Next.js App Router)

### Starter Options Considered

| Option              | Assessment                                                               |
| ------------------- | ------------------------------------------------------------------------ |
| **create-next-app** | ✅ Recommended — Clean foundation, official support, maximum flexibility |
| **create-t3-app**   | Alternative — More opinionated, includes tRPC/Prisma, uses NextAuth      |

### Selected Starter: create-next-app

**Rationale for Selection:**

- Project requires specific integrations (BetterAuth, Pusher, Upstash) not bundled in T3
- Simpler architecture aligns with Low-Medium complexity assessment
- Official starter ensures maximum compatibility with 16+ features
- Avoids tRPC abstraction when API routes are sufficient

**Initialization Command:**

```bash
npx create-next-app@latest tambola --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Architectural Decisions Provided by Starter:**

| Decision      | Value               |
| ------------- | ------------------- |
| **Language**  | TypeScript (strict) |
| **Routing**   | App Router (app/)   |
| **Styling**   | Tailwind CSS        |
| **Linting**   | ESLint              |
| **Structure** | src/ directory      |
| **Imports**   | @/\* alias          |

**Post-Initialization Setup Required:**

1. Add shadcn/ui components
2. Configure NeonDB + Prisma ORM
3. Integrate BetterAuth
4. Set up Pusher client/server
5. Configure Upstash Redis client

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Database: NeonDB + Prisma ORM
- Auth: BetterAuth (email/password)
- Real-time: Pusher Channels
- Claim locking: Redis SETNX

**Important Decisions (Shape Architecture):**

- State Management: Zustand v5.0.8
- Project Structure: Feature-based folders
- API Pattern: Next.js API Routes (REST)

### Data Architecture

| Component          | Decision                             | Version      |
| ------------------ | ------------------------------------ | ------------ |
| **Database**       | NeonDB (PostgreSQL)                  | Postgres 15+ |
| **ORM**            | Prisma                               | Latest       |
| **Client Pattern** | Global singleton in `/lib/prisma.ts` | -            |
| **Migrations**     | Prisma Migrate                       | -            |

### Authentication & Security

| Component            | Decision                    |
| -------------------- | --------------------------- |
| **Auth Provider**    | BetterAuth (email/password) |
| **Sessions**         | Server-side, secure cookies |
| **Server Authority** | All game logic server-only  |
| **Claim Locking**    | Redis SETNX atomic pattern  |

### API & Communication Patterns

| Component           | Decision                           |
| ------------------- | ---------------------------------- |
| **API Style**       | REST via Next.js API Routes        |
| **Route Structure** | `/api/game/[gameId]/*`             |
| **Real-time**       | Pusher Channels (`game-{gameId}`)  |
| **Error Format**    | `{ error: string, code?: string }` |

### Frontend Architecture

| Component            | Decision                                      | Version |
| -------------------- | --------------------------------------------- | ------- |
| **State Management** | Zustand                                       | v5.0.8  |
| **UI Components**    | shadcn/ui (Radix primitives)                  | Latest  |
| **Styling**          | Tailwind CSS                                  | Latest  |
| **Server/Client**    | RSC default, `"use client"` for interactivity | -       |

### Project Structure

Feature-based organization:

```
/src
├── app/              # Pages, layouts, API routes
├── features/
│   ├── auth/         # Auth components, hooks
│   └── game/         # Game UI, stores, logic
├── lib/              # Shared utilities (prisma, pusher, redis)
└── components/       # Shared UI components
```

### Documentation Strategy

Use **Context7 MCP** for all documentation-related queries to retrieve latest docs for:

- Next.js, Prisma, Zustand, Pusher, BetterAuth, shadcn/ui

---

## Implementation Patterns & Consistency Rules

### Naming Patterns

| Category                   | Convention         | Example                                    |
| -------------------------- | ------------------ | ------------------------------------------ |
| **Database Tables**        | camelCase, plural  | `users`, `games`, `playerTickets`          |
| **DB Columns**             | camelCase          | `createdAt`, `gameId`, `calledNumbers`     |
| **API Routes**             | kebab-case, plural | `/api/games`, `/api/games/[gameId]/claims` |
| **Components**             | PascalCase         | `GameLobby.tsx`, `TicketCard.tsx`          |
| **Files (non-components)** | kebab-case         | `pusher-client.ts`, `game-store.ts`        |
| **Functions**              | camelCase          | `createGame`, `verifyClaimPattern`         |
| **Zustand Stores**         | `use{Name}Store`   | `useGameStore`, `useAuthStore`             |
| **Constants**              | SCREAMING_SNAKE    | `MAX_PLAYERS`, `CALL_INTERVAL_MS`          |

### Data Format Patterns

| Aspect           | Convention                                  |
| ---------------- | ------------------------------------------- |
| **JSON Fields**  | camelCase (consistent across frontend & DB) |
| **Dates in API** | ISO 8601 strings (`2026-01-06T15:00:00Z`)   |
| **IDs**          | nanoid or CUID (not auto-increment)         |
| **Booleans**     | `true`/`false` (never 1/0)                  |

### API Response Format

```typescript
// Success Response
{ data: T }

// Error Response
{ error: string, code?: string }

// Examples
{ data: { gameId: "abc123", title: "Diwali Tambola" } }
{ error: "Game not found", code: "GAME_NOT_FOUND" }
```

### Pusher Event Naming

```typescript
// Format: {entity}:{action}
"number:called"; // When a number is called
"claim:accepted"; // When a claim is verified and accepted
"claim:rejected"; // When a claim fails verification
"game:ended"; // When Full House is claimed
"player:joined"; // When a player joins the lobby
"player:left"; // When a player disconnects
```

### State Management Patterns

| Pattern            | Convention                           |
| ------------------ | ------------------------------------ |
| **Store Files**    | `{feature}-store.ts`                 |
| **Loading States** | `isLoading`, `isSubmitting` booleans |
| **Error States**   | `error: string \| null`              |
| **Selectors**      | Inline arrow functions for perf      |

### Error Handling Patterns

| Context        | Pattern                                         |
| -------------- | ----------------------------------------------- |
| **API Routes** | Try-catch, return `{ error }` format            |
| **Validation** | Zod schemas for all API inputs                  |
| **Client**     | React Error Boundaries for UI crashes           |
| **Logging**    | `console.error` in dev, structured logs in prod |

### Enforcement Guidelines

**All AI Agents MUST:**

1. Follow camelCase for all JSON fields (frontend and database)
2. Use Zod schemas for API input validation
3. Return `{ data }` or `{ error }` format from all API routes
4. Use `"use client"` directive only when component needs interactivity
5. Colocate tests with features: `feature-name.test.ts`

**Anti-Patterns to Avoid:**

- ❌ snake_case in JSON responses
- ❌ Auto-increment IDs exposed to clients
- ❌ Trusting client-submitted data without validation
- ❌ Direct database calls from components (use API routes)

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
tambola/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.local
├── .env.example
├── .gitignore
├── components.json                    # shadcn/ui config
│
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── migrations/                    # Prisma migrations
│
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Landing page
│   │   │
│   │   ├── (auth)/                    # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── dashboard/                 # Host dashboard
│   │   │   ├── page.tsx               # Game history
│   │   │   └── create/page.tsx        # Create game
│   │   │
│   │   ├── game/[gameId]/             # Game routes
│   │   │   ├── page.tsx               # Join/Lobby view
│   │   │   ├── play/page.tsx          # Active game
│   │   │   └── results/page.tsx       # Final leaderboard
│   │   │
│   │   └── api/
│   │       ├── auth/[...betterauth]/route.ts
│   │       ├── games/
│   │       │   ├── route.ts           # POST create, GET list
│   │       │   └── [gameId]/
│   │       │       ├── route.ts       # GET game state
│   │       │       ├── join/route.ts  # POST join game
│   │       │       ├── start/route.ts # POST start game
│   │       │       ├── claim/route.ts # POST submit claim
│   │       │       └── state/route.ts # GET full state (reconnect)
│   │       └── pusher/
│   │           └── auth/route.ts      # Pusher auth endpoint
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/            # LoginForm, SignupForm
│   │   │   ├── hooks/                 # useAuth, useSession
│   │   │   └── auth-store.ts          # Zustand store
│   │   │
│   │   └── game/
│   │       ├── components/
│   │       │   ├── Ticket.tsx         # Player ticket grid
│   │       │   ├── NumberDisplay.tsx  # Called number animation
│   │       │   ├── NumberHistory.tsx  # Last 10 numbers
│   │       │   ├── ClaimModal.tsx     # Pattern claim UI
│   │       │   ├── Leaderboard.tsx    # Score display
│   │       │   └── Lobby.tsx          # Pre-game waiting room
│   │       ├── hooks/
│   │       │   ├── usePusher.ts       # Pusher subscription
│   │       │   └── useGameState.ts    # Game state sync
│   │       ├── lib/
│   │       │   ├── patterns.ts        # Pattern validation logic
│   │       │   └── ticket-generator.ts # Ticket generation
│   │       └── game-store.ts          # Zustand game store
│   │
│   ├── components/
│   │   └── ui/                        # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       └── ...
│   │
│   ├── lib/
│   │   ├── prisma.ts                  # Prisma singleton
│   │   ├── pusher-server.ts           # Server-side Pusher
│   │   ├── pusher-client.ts           # Client-side Pusher
│   │   ├── redis.ts                   # Upstash Redis client
│   │   ├── auth.ts                    # BetterAuth config
│   │   └── utils.ts                   # cn() helper, etc.
│   │
│   └── types/
│       ├── game.ts                    # Game, Ticket, Claim types
│       └── api.ts                     # API response types
│
├── public/
│   ├── sounds/
│   │   └── number-call.mp3            # Number announcement
│   └── favicon.ico
│
└── tests/
    ├── features/
    │   ├── auth/
    │   └── game/
    │       ├── patterns.test.ts       # Pattern validation tests
    │       └── ticket-generator.test.ts
    └── e2e/
        └── game-flow.spec.ts          # Playwright E2E
```

### Requirements to Structure Mapping

| Epic/Feature           | Location                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------- |
| **Authentication**     | `src/features/auth/`, `src/app/api/auth/`, `src/app/(auth)/`                       |
| **Game Creation**      | `src/app/dashboard/create/`, `src/app/api/games/route.ts`                          |
| **Game Lobby**         | `src/features/game/components/Lobby.tsx`, `src/app/game/[gameId]/`                 |
| **Number Calling**     | `src/features/game/components/NumberDisplay.tsx`, API routes                       |
| **Ticket Interaction** | `src/features/game/components/Ticket.tsx`                                          |
| **Claims**             | `src/features/game/components/ClaimModal.tsx`, `src/app/api/games/[gameId]/claim/` |
| **Leaderboard**        | `src/features/game/components/Leaderboard.tsx`                                     |

### Architectural Boundaries

| Boundary            | Pattern                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| **API ↔ Client**    | API routes return `{ data }` or `{ error }`, client consumes via fetch |
| **Server ↔ Pusher** | Server triggers events, client subscribes to `game-{gameId}` channel   |
| **API ↔ Database**  | All DB access through Prisma in `/lib/prisma.ts`                       |
| **API ↔ Redis**     | Claim locking only via `/lib/redis.ts`                                 |

### Integration Points

| Integration       | Location                | Purpose                        |
| ----------------- | ----------------------- | ------------------------------ |
| **Pusher Server** | `/lib/pusher-server.ts` | Trigger events from API routes |
| **Pusher Client** | `/lib/pusher-client.ts` | Subscribe to game channels     |
| **Redis Client**  | `/lib/redis.ts`         | SETNX claim lock operations    |
| **Prisma Client** | `/lib/prisma.ts`        | All database operations        |
| **BetterAuth**    | `/lib/auth.ts`          | Session management             |

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts:

- Next.js 16+ App Router compatible with all integrations
- Prisma works with NeonDB PostgreSQL
- Pusher integrates with serverless API routes
- Zustand works seamlessly with React Server Components
- BetterAuth provides simple session management

**Pattern Consistency:**

- camelCase used consistently for JSON fields (frontend and database)
- API response format (`{ data }` / `{ error }`) applied uniformly
- Naming conventions align with chosen stack

**Structure Alignment:**

- Feature-based organization supports all architectural decisions
- Boundaries are clearly defined and respected
- Integration points are properly structured

### Requirements Coverage ✅

**Functional Requirements (48 FRs):**
| Category | Structure Location | Status |
|----------|-------------------|--------|
| Authentication (4) | `src/features/auth/`, `src/app/api/auth/` | ✅ Covered |
| Game Creation (8) | `src/app/dashboard/create/`, `src/app/api/games/` | ✅ Covered |
| Lobby Management (6) | `src/features/game/components/Lobby.tsx` | ✅ Covered |
| Number Calling (5) | `src/features/game/components/NumberDisplay.tsx` | ✅ Covered |
| Ticket Interaction (4) | `src/features/game/components/Ticket.tsx` | ✅ Covered |
| Claim System (7) | `src/app/api/games/[gameId]/claim/` | ✅ Covered |
| Game Completion (3) | `src/app/game/[gameId]/results/` | ✅ Covered |
| Resilience (3) | `src/app/api/games/[gameId]/state/` | ✅ Covered |
| Game History (2) | `src/app/dashboard/` | ✅ Covered |
| Prize Patterns (6) | `src/features/game/lib/patterns.ts` | ✅ Covered |

**Non-Functional Requirements:**
| NFR | Architectural Support |
|-----|----------------------|
| Performance (<2s broadcast) | Pusher Channels for real-time |
| Performance (<500ms claims) | Redis SETNX atomic locking |
| Reliability (99% uptime) | Vercel edge + Pusher reliability |
| Security (server-authoritative) | All game logic in API routes |
| Scalability (75 players) | Pusher handles concurrent connections |

### Implementation Readiness ✅

**Decision Completeness:**

- ✅ All critical decisions documented with versions
- ✅ Implementation patterns are comprehensive
- ✅ Consistency rules are clear and enforceable
- ✅ Examples provided for major patterns

**Structure Completeness:**

- ✅ Complete project directory tree defined
- ✅ All files and directories specified
- ✅ Integration points clearly documented
- ✅ Component boundaries well-defined

**Pattern Completeness:**

- ✅ All potential conflict points addressed
- ✅ Naming conventions comprehensive
- ✅ Communication patterns fully specified
- ✅ Error handling patterns documented

### Gap Analysis

| Priority         | Gap                          | Resolution                        |
| ---------------- | ---------------------------- | --------------------------------- |
| **Important**    | Database schema not detailed | Will be defined in epics/stories  |
| **Nice-to-have** | CI/CD pipeline not defined   | Can add with GitHub Actions later |

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low-Medium)
- [x] Technical constraints identified (Vercel, Pusher, Redis limits)
- [x] Cross-cutting concerns mapped (5 identified)

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**

- [x] Naming conventions established (camelCase everywhere)
- [x] Structure patterns defined (feature-based)
- [x] Communication patterns specified (Pusher events)
- [x] Process patterns documented (error handling, validation)

**✅ Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**

- Server-authoritative design prevents cheating
- Clear separation of concerns (API, features, lib)
- Consistent patterns across all layers
- Context7 MCP for always-up-to-date documentation

**Areas for Future Enhancement:**

- Add monitoring and observability
- Define CI/CD pipeline
- Consider caching strategies for game state

### Implementation Handoff

**AI Agent Guidelines:**

1. Follow all architectural decisions exactly as documented
2. Use implementation patterns consistently across all components
3. Respect project structure and boundaries
4. Refer to this document for all architectural questions
5. Use **Context7 MCP** for latest library documentation

**First Implementation Step:**

```bash
npx create-next-app@latest tambola --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Post-Initialization Setup:**

1. `npx shadcn@latest init`
2. Configure Prisma with NeonDB
3. Set up BetterAuth
4. Configure Pusher client/server
5. Set up Upstash Redis client
