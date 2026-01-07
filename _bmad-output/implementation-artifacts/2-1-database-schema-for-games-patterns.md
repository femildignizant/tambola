# Story 2.1: Database Schema for Games & Patterns

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **the game and pattern database schema defined**,
so that **game creation can persist data correctly**.

## Acceptance Criteria

1. **Given** Prisma is configured
   **When** migrations are run
   **Then** a `Game` table exists with fields: id, title, hostId, status, numberInterval, minPlayers, maxPlayers, createdAt, updatedAt, gameCode

2. **Given** Prisma is configured
   **When** migrations are run
   **Then** a `GamePattern` table exists linking games to enabled patterns with point values

3. **Given** Prisma is configured
   **When** migrations are run
   **Then** a `Pattern` enum defines the 6 default patterns (FIRST_ROW, SECOND_ROW, THIRD_ROW, EARLY_FIVE, FOUR_CORNERS, FULL_HOUSE)

4. **Given** pattern variants are required
   **When** a pattern is configured
   **Then** tiered points are supported (1st, 2nd, 3rd claimers)

5. **Given** game state must be tracked
   **When** a game is created
   **Then** a `GameStatus` enum defines states: CONFIGURING, LOBBY, STARTED, COMPLETED

## Tasks / Subtasks

- [ ] Define Game Model (AC: 1, 5)

  - [ ] Create `GameStatus` enum with CONFIGURING, LOBBY, STARTED, COMPLETED states
  - [ ] Create `Game` model with all required fields
  - [ ] Add relation to User (host)
  - [ ] Add unique constraint on `gameCode`
  - [ ] Add indexes for common queries (hostId, status)

- [ ] Define Pattern Enum (AC: 3)

  - [ ] Create `Pattern` enum with 6 patterns: FIRST_ROW, SECOND_ROW, THIRD_ROW, EARLY_FIVE, FOUR_CORNERS, FULL_HOUSE

- [ ] Define GamePattern Model (AC: 2, 4)

  - [ ] Create junction table linking Game to enabled patterns
  - [ ] Add point values (points1st, points2nd, points3rd) for tiered scoring
  - [ ] Add `enabled` boolean for pattern toggle
  - [ ] Add unique constraint on (gameId, pattern)

- [ ] Create and Run Migration (AC: 1-5)

  - [ ] Generate migration with `npx prisma migrate dev --name add_game_schema`
  - [ ] Verify migration applies successfully
  - [ ] Regenerate Prisma client

- [ ] Validate Schema (AC: 1-5)
  - [ ] Confirm all tables created in NeonDB
  - [ ] Test basic CRUD operations via Prisma Studio

## Dev Notes

### Schema Design Rationale

**Game Table:**
The Game table is the central entity for game creation. It stores:

- `id`: CUID (per architecture - no auto-increment)
- `title`: Host-provided game name (1-100 chars)
- `hostId`: Foreign key to User who created the game
- `status`: GameStatus enum tracking game lifecycle
- `gameCode`: 6-character alphanumeric code for sharing (Story 2.5 uses this)
- `numberInterval`: Calling interval in seconds (7, 10, or 15)
- `minPlayers`: Minimum players required (2-75)
- `maxPlayers`: Maximum players allowed (2-75)
- `createdAt`, `updatedAt`: Audit timestamps

**GamePattern Table:**
Junction table for many-to-many relationship between Game and patterns. Each record represents an enabled pattern for a game with its point configuration:

- `id`: CUID primary key
- `gameId`: Foreign key to Game
- `pattern`: Pattern enum value
- `enabled`: Whether this pattern is active (default true)
- `points1st`: Points for first claimer
- `points2nd`: Points for second claimer (optional tiered scoring)
- `points3rd`: Points for third claimer (optional tiered scoring)

### Prisma Schema Implementation

```prisma
// Add to prisma/schema.prisma

enum GameStatus {
  CONFIGURING
  LOBBY
  STARTED
  COMPLETED
}

enum Pattern {
  FIRST_ROW
  SECOND_ROW
  THIRD_ROW
  EARLY_FIVE
  FOUR_CORNERS
  FULL_HOUSE
}

model Game {
  id             String       @id @default(cuid())
  title          String       @db.VarChar(100)
  hostId         String
  host           User         @relation(fields: [hostId], references: [id], onDelete: Cascade)
  status         GameStatus   @default(CONFIGURING)
  gameCode       String       @unique @db.VarChar(6)
  numberInterval Int          @default(10) // seconds: 7, 10, or 15
  minPlayers     Int          @default(2)
  maxPlayers     Int          @default(75)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  patterns       GamePattern[]

  @@map("game")
  @@index([hostId])
  @@index([status])
  @@index([gameCode])
}

model GamePattern {
  id        String   @id @default(cuid())
  gameId    String
  game      Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  pattern   Pattern
  enabled   Boolean  @default(true)
  points1st Int      @default(100)
  points2nd Int?     // Null if no tiered scoring
  points3rd Int?     // Null if no tiered scoring
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([gameId, pattern])
  @@map("gamePattern")
  @@index([gameId])
}
```

### User Model Update Required

Add the games relation to the existing User model:

```prisma
model User {
  // ... existing fields ...
  games         Game[]  // Add this line

  @@map("user")
}
```

### Naming Convention Compliance

Per architecture.md and project-context.md:

- **Tables**: camelCase (`game`, `gamePattern` via @@map)
- **Columns**: camelCase (`hostId`, `gameCode`, `createdAt`)
- **Enums**: SCREAMING_SNAKE for values (`FIRST_ROW`, `EARLY_FIVE`)
- **IDs**: CUID via `@default(cuid())` - NOT auto-increment

### Game Code Generation

For Story 2.5 (Generate Shareable Link), the game code will need:

- 6 alphanumeric characters (uppercase letters + digits)
- Unique across all games
- Example format: `A3B2C1`, `XY7PQ9`

Generation will be handled in the API route (Story 2.2), not in Prisma. Prisma just enforces uniqueness.

### Default Pattern Points

MVP default point values for patterns:
| Pattern | 1st Place | 2nd Place | 3rd Place |
|--------------|-----------|-----------|-----------|
| First Row | 100 | null | null |
| Second Row | 100 | null | null |
| Third Row | 100 | null | null |
| Early Five | 150 | 100 | 50 |
| Four Corners | 200 | null | null |
| Full House | 500 | 300 | 100 |

### Architecture Compliance

**From Architecture Document:**

- Database: NeonDB (PostgreSQL 15+) ✓
- ORM: Prisma with global singleton ✓
- IDs: CUID (not auto-increment) ✓
- Naming: camelCase for tables/columns ✓
- Timestamps: createdAt, updatedAt on all records ✓

**Server-Authoritative Design:**

- Game state stored in PostgreSQL (authoritative source)
- All game logic modifications via API routes
- Client never directly modifies game state

### Implementation Constraints

**From Project Context:**

- NeonDB cold starts ~500ms: Use connection pooling (already configured per Story 1.1)
- Transaction isolation for claims: Schema supports pattern locking via unique constraint

**From PRD - FR Coverage:**

- FR5: Create game with custom title → `title` field ✓
- FR6-FR8: Pattern configuration → `GamePattern` table ✓
- FR9: Number calling interval → `numberInterval` field ✓
- FR10: Player limits → `minPlayers`, `maxPlayers` fields ✓
- FR11-FR12: Shareable link/code → `gameCode` field ✓
- FR43-FR48: 6 prize patterns → `Pattern` enum ✓

### Testing Approach

After migration:

```bash
# Run migration
npx prisma migrate dev --name add_game_schema

# Open Prisma Studio to verify
npx prisma studio
```

**Verification Checklist:**

1. [ ] `Game` table exists with all columns
2. [ ] `GamePattern` table exists with foreign key to Game
3. [ ] `GameStatus` enum has 4 values
4. [ ] `Pattern` enum has 6 values
5. [ ] Unique constraint on `gameCode` works
6. [ ] Cascading delete works (delete Game → deletes GamePatterns)
7. [ ] User relation verified (hostId → User.id)

### Project Structure Notes

**Modified Files:**

- `prisma/schema.prisma` - Add Game, GamePattern models and enums

**No New Feature Files:**
This story only modifies the database schema. No components, hooks, or API routes are created.

**Alignment with Architecture:**

- Schema follows feature-based structure for future game feature
- Relations prepared for Epic 3 (Player, Ticket) and Epic 4-5 (Claims)

### Previous Story Intelligence

**From Story 1.1-1.5 (Epic 1 - Auth):**

- Prisma schema generated to `src/generated/prisma`
- User, Session, Account, Verification models exist
- `@@map()` directive used for table naming
- `@@index()` used for query optimization
- Relations use `@relation` with explicit foreign keys
- `onDelete: Cascade` for dependent records

**Existing Schema Patterns:**

```prisma
// Pattern from existing schema
model User {
  id        String   @id @default(cuid())
  createdAt DateTime
  updatedAt DateTime
  @@map("user")
}
```

Follow same patterns for new models.

### Git Commit Strategy

**Proposed Commit:**

```
feat: add Game and GamePattern database schema for game creation

- Add GameStatus enum (CONFIGURING, LOBBY, STARTED, COMPLETED)
- Add Pattern enum (6 prize patterns)
- Add Game model with host relation and game settings
- Add GamePattern junction table for pattern configuration
- Add unique constraint on gameCode for shareable codes
```

### References

- [Epics: Story 2.1](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-2.1:-Database-Schema-for-Games-&-Patterns)
- [Architecture: Data Architecture](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#Data-Architecture)
- [Architecture: Project Structure](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#Project-Structure)
- [Project Context: Database Rules](file:///Users/mac/Desktop/femil/tambola/_bmad-output/project-context.md#Database-&-Claim-Handling-Rules)
- [Existing Prisma Schema](file:///Users/mac/Desktop/femil/tambola/prisma/schema.prisma)
- [Prisma Docs - Data Modeling](https://www.prisma.io/docs/orm/prisma-schema/data-model)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
