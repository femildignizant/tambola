---
project_name: "tambola"
user_name: "femil"
date: "2026-01-06"
sections_completed:
  [
    "technology_stack",
    "framework_rules",
    "database_rules",
    "game_logic",
    "anti_patterns",
    "state_management",
    "naming_conventions",
  ]
status: "complete"
rule_count: 52
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Layer                | Technology           | Version      | Notes                                            |
| -------------------- | -------------------- | ------------ | ------------------------------------------------ |
| **Framework**        | Next.js (App Router) | 14.x+        | Use App Router conventions only                  |
| **Hosting**          | Vercel               | Serverless   | 30-second function timeout constraint            |
| **Database**         | NeonDB (PostgreSQL)  | Postgres 15+ | Use connection pooling for cold start mitigation |
| **ORM**              | Prisma               | Latest       | Type-safe queries, global singleton pattern      |
| **Real-time**        | Pusher Channels      | Latest       | Primary real-time communication layer            |
| **Caching/Locks**    | Upstash Redis        | Latest       | For claim race condition handling (SETNX)        |
| **Auth**             | BetterAuth           | Latest       | Email/password only, no social login             |
| **State Management** | Zustand              | v5.0.8       | Lightweight, hook-based client state             |
| **UI Components**    | shadcn/ui            | Latest       | Radix primitives with Tailwind                   |
| **Package Manager**  | npm                  | -            | Standard package management                      |

### Critical Version Constraints

- **Vercel Serverless**: No native WebSocket support; always use Pusher for real-time
- **NeonDB Cold Starts**: First query ~500ms delay; use connection pooling
- **Pusher Free Tier**: 200k messages/day limit; batch updates where possible
- **Upstash Free Tier**: 10k commands/day limit; use efficiently for claim locking

---

## Framework-Specific Rules

### Next.js App Router

- **Server Components by default**: Only use `"use client"` when component needs interactivity or browser APIs
- **API Routes for mutations**: All game state changes go through `/api/` routes, not server actions
- **Route structure**: `/api/game/[gameId]/...` for game-specific endpoints
- **Environment variables**: Server-only secrets use no prefix; client-exposed vars use `NEXT_PUBLIC_`

### Real-time Architecture (Pusher)

- **Server-authoritative design**: All number generation and claim verification happens on server
- **Channel naming**: Use `game-{gameId}` pattern for all game channels
- **Event types**:
  - `number-called` - Broadcast called number to all players
  - `claim-accepted` - Announce successful claim to all players
  - `game-ended` - Signal Full House and final leaderboard
  - `reaction` - Broadcast floating emoji reactions
- **Client subscription**: Subscribe on game join, unsubscribe on leave/disconnect
- **Never trust client**: Always verify claims server-side before broadcasting

### State Reconciliation

- **On reconnect**: Fetch full game state from `/api/game/[gameId]/state`
- **Optimistic UI**: Show numbers immediately on Pusher receive
- **Timestamp every call**: Include server timestamp for audit trail and sync verification

### Zustand State Management

- **Store naming**: `use{Name}Store` pattern (e.g., `useGameStore`, `useAuthStore`)
- **Store files**: `{feature}-store.ts` in feature folder
- **Loading states**: Use `isLoading`, `isSubmitting` booleans
- **Error states**: Use `error: string | null`
- **Selectors**: Inline arrow functions for performance

---

## Database & Claim Handling Rules

### PostgreSQL (NeonDB)

- **Connection pooling required**: Use pooled connection string for all queries
- **Transaction isolation for claims**: Use `FOR UPDATE SKIP LOCKED` for claim verification
- **Ticket generation**: Server-side only; never generate tickets on client

### Claim Race Condition Handling (Redis SETNX)

- **Atomic locking pattern**: Use Redis `SETNX` for first-come-first-served claims
- **Key format**: `claim:{gameId}:{pattern}:{variant}` (e.g., `claim:abc123:fullhouse:1`)
- **Lock flow**:
  1. Attempt `SETNX` with player ID as value
  2. If successful → save to Postgres, broadcast via Pusher
  3. If failed → return "Already claimed" error
- **No TTL on claim keys**: Claims are permanent for game duration

### Database Schema Principles

- **Timestamps on all records**: `createdAt`, `updatedAt` for audit trail (camelCase)
- **Game state in Postgres**: Authoritative game state lives in database
- **Redis for hot data only**: Active game locks, not historical data
- **Ticket storage**: Store generated tickets in Postgres with player association
- **Prisma singleton**: Use global `prisma` instance from `/lib/prisma.ts`

---

## Naming Conventions

| Category                   | Convention         | Example                                    |
| -------------------------- | ------------------ | ------------------------------------------ |
| **Database Tables**        | camelCase, plural  | `users`, `games`, `playerTickets`          |
| **DB Columns**             | camelCase          | `createdAt`, `gameId`, `calledNumbers`     |
| **JSON Fields**            | camelCase          | Consistent across frontend & database      |
| **API Routes**             | kebab-case, plural | `/api/games`, `/api/games/[gameId]/claims` |
| **Components**             | PascalCase         | `GameLobby.tsx`, `TicketCard.tsx`          |
| **Files (non-components)** | kebab-case         | `pusher-client.ts`, `game-store.ts`        |
| **Functions**              | camelCase          | `createGame`, `verifyClaimPattern`         |
| **Constants**              | SCREAMING_SNAKE    | `MAX_PLAYERS`, `CALL_INTERVAL_MS`          |

### API Response Format

```typescript
// Success: { data: T }
// Error:   { error: string, code?: string }
```

---

## Game Logic Rules

### Ticket Generation

- **Server-generated only**: Generate tickets via secure server-side algorithm
- **Standard Tambola format**: 3 rows × 9 columns, 5 numbers per row (15 total)
- **Column constraints**: Column 1 = 1-9, Column 2 = 10-19, ..., Column 9 = 80-90
- **Unique per player**: Each player gets unique ticket(s) per game

### Number Calling

- **Random selection**: Numbers 1-90, no repeats within game
- **Interval options**: 7s / 10s / 15s (host configurable)
- **Auto-call mode only**: No manual number calling in MVP
- **Broadcast immediately**: Call number → store with timestamp → broadcast via Pusher

### Claim Verification Logic

- **Pattern matching**: Verify player's marked numbers match called numbers for pattern
- **Patterns supported**: First Row, Second Row, Third Row, Early Five, Four Corners, Full House
- **Tiered variants**: Same pattern can have multiple claimers with decreasing points
- **Invalid claim response**: Return clear error message, don't broadcast

---

## Critical Don't-Miss Rules

### Security Anti-Patterns

- ❌ **Never generate random numbers on client** - Always server-side
- ❌ **Never trust client-submitted ticket data** - Server owns ticket records
- ❌ **Never allow claim without verification** - Always check against called numbers

### Performance Anti-Patterns

- ❌ **Don't poll for updates** - Use Pusher subscription only
- ❌ **Don't make individual Redis calls per claim check** - Batch where possible
- ❌ **Don't skip connection pooling** - NeonDB cold starts will hurt UX

### UX Requirements

- ✅ **Show last 10 called numbers** - History visible during gameplay
- ✅ **Manual marking only** - Don't auto-highlight numbers on ticket
- ✅ **Mutable sound** - Allow players to mute number announcement
- ✅ **Floating reactions** - Emoji reactions broadcast to all players

### Game Flow Constraints

- **Game ends on Full House** - No other end condition
- **No mid-game player removal** - Players stay until game ends
- **No pause functionality** - Auto-call runs until completion
- **1 ticket per player** - Fixed for MVP (no customization)

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

---

## Documentation Strategy

**CRITICAL: Use Context7 MCP** for all documentation-related queries to retrieve LIVE documentation for:

- **BetterAuth** (Authentication setup & schema)
- **Prisma** (Schema definitions & migrations)
- **Next.js** (App Router patterns)
- **Zustand** (State management patterns)
- **Pusher** (Real-time integration)
- **shadcn/ui** (Component usage)

**Why?** To prevent "version drift" issues (e.g., mismatched boilerplate vs current library versions). Always check current docs before implementation.

---

_Last Updated: 2026-01-06_
