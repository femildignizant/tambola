---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
workflowType: "epics"
project_name: "tambola"
user_name: "femil"
date: "2026-01-06"
status: "completed"
---

# Tambola - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Tambola, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Authentication & User Management (4 FRs)**

- FR1: Users can create an account with email and password
- FR2: Users can log in with their credentials
- FR3: Users can log out of their account
- FR4: Users can reset their password via email

**Game Creation & Configuration (8 FRs)**

- FR5: Hosts can create a new game with a custom title
- FR6: Hosts can select which prize patterns are enabled for their game
- FR7: Hosts can configure point values for each prize pattern
- FR8: Hosts can configure pattern variants with tiered points (1st, 2nd, 3rd claimers)
- FR9: Hosts can set the number calling interval (7s, 10s, or 15s)
- FR10: Hosts can set minimum and maximum player limits (2-75)
- FR11: Hosts can generate a shareable game link
- FR12: Hosts can view a unique 6-digit game code for sharing

**Game Lobby (6 FRs)**

- FR13: Players can join a game via shareable link
- FR14: Players can join a game by entering a 6-digit code
- FR15: Players can see their assigned ticket upon joining
- FR16: Players can see the game title and settings in the lobby
- FR17: Hosts can see real-time player count in the lobby
- FR18: Hosts can start the game when minimum players have joined

**Gameplay - Number Calling (5 FRs)**

- FR19: The system automatically calls numbers at the configured interval
- FR20: All players see the called number with visual animation
- FR21: All players hear an audio announcement (if unmuted)
- FR22: Players can mute/unmute sound during gameplay
- FR23: Players can see the last 10 called numbers in history

**Gameplay - Ticket Interaction (4 FRs)**

- FR24: Players can see their personal ticket in standard Tambola format (3 rows × 9 columns)
- FR25: Players can tap/click numbers on their ticket to mark them
- FR26: Players can see visual feedback when a number is marked
- FR27: Players can see which numbers on their ticket have been called but not yet marked

**Gameplay - Claims (7 FRs)**

- FR28: Players can initiate a claim at any time during gameplay
- FR29: Players can select which pattern they are claiming
- FR30: The system automatically verifies if the claim is valid
- FR31: Valid claims are awarded points according to the pattern configuration
- FR32: Valid claims are announced to all players in real-time
- FR33: Invalid claims show an error message to the claiming player
- FR34: Players can see which patterns have already been claimed

**Game Completion (3 FRs)**

- FR35: The game automatically ends when Full House is claimed
- FR36: All players see the final leaderboard with scores upon game end
- FR37: Hosts can see the final results summary

**Resilience & State Management (3 FRs)**

- FR38: Players can join a game in progress (mid-game join)
- FR39: Players who disconnect can rejoin and recover their game state
- FR40: The system syncs game state for reconnecting players

**Game History (2 FRs)**

- FR41: Users can view their past games
- FR42: Users can see their performance in past games

**Prize Patterns - MVP (6 FRs)**

- FR43: The system supports First Row pattern
- FR44: The system supports Second Row pattern
- FR45: The system supports Third Row pattern
- FR46: The system supports Early Five pattern
- FR47: The system supports Four Corners pattern
- FR48: The system supports Full House pattern

**Total: 48 Functional Requirements**

### Non-Functional Requirements

**Performance**

- NFR1: Number broadcast latency < 2 seconds (all players see number within 2s of server call)
- NFR2: Claim resolution < 500ms (first-come-first-served must be instant)
- NFR3: Page load (lobby) < 3 seconds (players must join quickly from invite link)
- NFR4: Interaction response < 100ms (tap-to-mark must feel instant)
- NFR5: Leaderboard update in real-time (scores update immediately on valid claims)

**Reliability**

- NFR6: Uptime during active games 99% (games in progress must not fail)
- NFR7: State persistence 100% (no data loss on disconnect/reconnect)
- NFR8: Graceful degradation required (show meaningful errors, never blank screens)
- NFR9: Pusher auto-reconnect (automatic reconnection on connection drop)

**Security**

- NFR10: BetterAuth with email/password authentication (no OAuth for MVP)
- NFR11: Server-side sessions with secure cookies
- NFR12: Server authority for all game logic (client cannot be trusted)
- NFR13: Server-only claim verification (never trust client claim data)
- NFR14: Server-only ticket generation (tickets stored in database)
- NFR15: HTTPS only; no sensitive data stored beyond auth

**Scalability**

- NFR16: Concurrent players per game max 75 (per MVP player limit)
- NFR17: Concurrent games 50+ (free tier should support 50+ simultaneous games)
- NFR18: User growth to 1,000 users (free tier viability for first 1,000 registered users)
- NFR19: Pusher connections within free tier (100 concurrent connections)
- NFR20: Database size within free tier (NeonDB free tier limits)

**Maintainability**

- NFR21: Feature-based folder structure
- NFR22: Full TypeScript coverage
- NFR23: Structured logging for debugging
- NFR24: Integration-ready error monitoring (Sentry or similar)

**Total: 24 Non-Functional Requirements**

### Additional Requirements

**From Architecture - Starter Template:**

- AR1: Initialize project using `npx create-next-app@latest tambola --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- AR2: Add shadcn/ui components with `npx shadcn@latest init`
- AR3: Configure NeonDB + Prisma ORM
- AR4: Integrate BetterAuth for authentication
- AR5: Set up Pusher client/server for real-time
- AR6: Configure Upstash Redis client for claim locking

**From Architecture - Technical Stack:**

- AR7: Use Zustand v5.0.8 for state management
- AR8: Follow feature-based folder structure as defined in Architecture
- AR9: Use REST API pattern via Next.js API Routes
- AR10: All API responses must follow `{ data }` or `{ error }` format
- AR11: Use Zod schemas for API input validation

**From Architecture - Naming & Patterns:**

- AR12: Use camelCase for all database tables/columns and JSON fields
- AR13: Use kebab-case for API routes
- AR14: Use PascalCase for React components
- AR15: Use nanoid or CUID for IDs (not auto-increment)
- AR16: Follow Pusher event naming format: `{entity}:{action}`

**From Architecture - Constraints:**

- AR17: Handle Vercel 30s timeout constraint (use Pusher for all real-time)
- AR18: Efficient Pusher messaging (200k msg/day limit, batch updates)
- AR19: Efficient Redis commands (10k cmd/day limit)
- AR20: Handle NeonDB cold starts with connection pooling

**From Architecture - Security:**

- AR21: Server-authoritative design for all game logic
- AR22: Redis SETNX atomic pattern for claim locking
- AR23: Error Boundaries for UI crash handling

**Total: 23 Additional Requirements**

### FR Coverage Map

| FR   | Epic   | Description                                |
| ---- | ------ | ------------------------------------------ |
| FR1  | Epic 1 | Account creation with email/password       |
| FR2  | Epic 1 | User login                                 |
| FR3  | Epic 1 | User logout                                |
| FR4  | Epic 1 | Password reset via email                   |
| FR5  | Epic 2 | Create game with custom title              |
| FR6  | Epic 2 | Select prize patterns                      |
| FR7  | Epic 2 | Configure point values                     |
| FR8  | Epic 2 | Configure pattern variants (tiered points) |
| FR9  | Epic 2 | Set number calling interval                |
| FR10 | Epic 2 | Set player limits                          |
| FR11 | Epic 2 | Generate shareable link                    |
| FR12 | Epic 2 | View 6-digit game code                     |
| FR13 | Epic 3 | Join via shareable link                    |
| FR14 | Epic 3 | Join via 6-digit code                      |
| FR15 | Epic 3 | See assigned ticket                        |
| FR16 | Epic 3 | See game title/settings                    |
| FR17 | Epic 3 | Host sees real-time player count           |
| FR18 | Epic 3 | Host starts game                           |
| FR19 | Epic 4 | Auto number calling                        |
| FR20 | Epic 4 | Visual number animation                    |
| FR21 | Epic 4 | Audio announcement                         |
| FR22 | Epic 4 | Mute/unmute sound                          |
| FR23 | Epic 4 | Last 10 numbers history                    |
| FR24 | Epic 4 | Personal ticket display                    |
| FR25 | Epic 4 | Tap to mark numbers                        |
| FR26 | Epic 4 | Visual marking feedback                    |
| FR27 | Epic 4 | Called but not marked indicator            |
| FR28 | Epic 5 | Initiate claim                             |
| FR29 | Epic 5 | Select pattern to claim                    |
| FR30 | Epic 5 | Auto-verify claim                          |
| FR31 | Epic 5 | Award points for valid claims              |
| FR32 | Epic 5 | Announce valid claims                      |
| FR33 | Epic 5 | Show error for invalid claims              |
| FR34 | Epic 5 | Display claimed patterns                   |
| FR35 | Epic 5 | Auto-end on Full House                     |
| FR36 | Epic 5 | Final leaderboard display                  |
| FR37 | Epic 5 | Host results summary                       |
| FR38 | Epic 6 | Mid-game join                              |
| FR39 | Epic 6 | Reconnection recovery                      |
| FR40 | Epic 6 | State sync for reconnecting players        |
| FR41 | Epic 6 | View past games                            |
| FR42 | Epic 6 | View past performance                      |
| FR43 | Epic 2 | First Row pattern                          |
| FR44 | Epic 2 | Second Row pattern                         |
| FR45 | Epic 2 | Third Row pattern                          |
| FR46 | Epic 2 | Early Five pattern                         |
| FR47 | Epic 2 | Four Corners pattern                       |
| FR48 | Epic 2 | Full House pattern                         |

## Epic List

### Epic 1: Project Foundation & Authentication

Users can register, log in, and access the platform securely.

**User Outcome:** Users have accounts and can securely access Tambola.

**FRs Covered:** FR1, FR2, FR3, FR4

**Implementation Notes:**

- Sets up project with create-next-app (AR1-AR6)
- Implements BetterAuth with email/password
- Establishes foundational architecture patterns
- **Standalone:** Complete auth system works independently

---

### Epic 2: Game Creation & Configuration

Hosts can create fully-configured Tambola games with patterns, points, and sharing options.

**User Outcome:** A host has a shareable game ready to invite players.

**FRs Covered:** FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR43, FR44, FR45, FR46, FR47, FR48

**Implementation Notes:**

- Pattern system implementation (6 default patterns)
- Game configuration (points, intervals, player limits)
- Shareable link + 6-digit code generation
- **Requires Epic 1:** Uses auth for host identity
- **Standalone:** Game creation works without gameplay features

---

### Epic 3: Game Lobby & Player Joining

Players can join games and see their tickets; hosts can monitor and start games.

**User Outcome:** All players are in the lobby with tickets, ready to play.

**FRs Covered:** FR13, FR14, FR15, FR16, FR17, FR18

**Implementation Notes:**

- Join via link or code
- Ticket generation and assignment (server-side)
- Real-time lobby with player count (Pusher presence)
- Host start game control
- **Requires Epic 1 & 2:** Auth + created game
- **Standalone:** Lobby works without gameplay features

---

### Epic 4: Live Gameplay — Number Calling & Ticket Marking

Players experience real-time number calling and can mark their tickets.

**User Outcome:** Numbers are called automatically, players can mark tickets and see history.

**FRs Covered:** FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27

**Implementation Notes:**

- Auto number calling at configured interval
- Visual animation + audio announcements
- Ticket display in Tambola format (3×9 grid)
- Tap-to-mark with visual feedback
- Last 10 numbers history
- **Requires Epic 1, 2, 3:** Auth + game + lobby
- **Standalone:** Number calling works without claim system

---

### Epic 5: Claims & Game Completion

Players can claim patterns, get instant verification, and see the leaderboard when the game ends.

**User Outcome:** Players win prizes, claims are verified instantly, and the game concludes with a leaderboard.

**FRs Covered:** FR28, FR29, FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR37

**Implementation Notes:**

- Claim initiation and pattern selection
- Server-side verification with Redis locking (NFR12, NFR13, AR22)
- Winner announcements via Pusher
- Auto-end on Full House
- Leaderboard display
- **Requires Epic 1, 2, 3, 4:** Full game flow
- **Standalone:** Complete game from start to finish

---

### Epic 6: Resilience & Game History

Players can reconnect mid-game and view their game history.

**User Outcome:** Late joiners and disconnected players have seamless experience; users can review past games.

**FRs Covered:** FR38, FR39, FR40, FR41, FR42

**Implementation Notes:**

- Mid-game join with state sync
- Reconnection recovery
- Game history dashboard
- Past performance display
- **Requires all previous epics:** Enhances complete system
- **Standalone:** Adds resilience layer

---

## Epic Summary

| Epic      | Title                         | FRs    | Key Outcome                                |
| --------- | ----------------------------- | ------ | ------------------------------------------ |
| 1         | Foundation & Authentication   | 4      | Users can register and log in              |
| 2         | Game Creation & Configuration | 14     | Hosts can create shareable games           |
| 3         | Lobby & Player Joining        | 6      | Players join with tickets, ready to play   |
| 4         | Number Calling & Marking      | 9      | Real-time gameplay with ticket interaction |
| 5         | Claims & Game Completion      | 10     | Win prizes and complete games              |
| 6         | Resilience & History          | 5      | Reconnection and game history              |
| **Total** |                               | **48** | Complete Tambola MVP                       |

---

# Detailed Story Breakdown

## Epic 1: Project Foundation & Authentication — Stories

### Story 1.1: Project Initialization with Next.js

As a **developer**,
I want **a properly initialized Next.js project with all foundational dependencies**,
So that **I have a working codebase to build upon**.

**Acceptance Criteria:**

**Given** the project does not exist
**When** the initialization command is run
**Then** a Next.js 16+ project is created with TypeScript, Tailwind, ESLint, App Router, and src/ directory
**And** shadcn/ui is initialized with the default theme
**And** Prisma is configured with NeonDB connection string placeholder
**And** BetterAuth, Pusher, and Upstash Redis client files are scaffolded in `/lib`
**And** the feature-based folder structure matches the Architecture document
**And** `npm run dev` starts the server without errors

---

### Story 1.2: User Registration with Email

As a **new user**,
I want **to create an account with my email and password**,
So that **I can host and join Tambola games**.

**Acceptance Criteria:**

**Given** I am on the signup page
**When** I enter a valid email and password (min 8 chars)
**Then** my account is created in the database
**And** I am logged in and redirected to the dashboard
**And** I see a success message

**Given** I enter an email that already exists
**When** I submit the signup form
**Then** I see an error "Email already registered"

**Given** I enter an invalid email or weak password
**When** I submit the form
**Then** I see appropriate validation errors

---

### Story 1.3: User Login with Credentials

As a **registered user**,
I want **to log in with my email and password**,
So that **I can access my account and games**.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I enter valid credentials
**Then** I am logged in and redirected to the dashboard
**And** my session is stored securely (server-side cookie)

**Given** I enter incorrect credentials
**When** I submit the login form
**Then** I see an error "Invalid email or password"

**Given** I am already logged in
**When** I navigate to the login page
**Then** I am redirected to the dashboard

---

### Story 1.4: User Logout

As a **logged-in user**,
I want **to log out of my account**,
So that **I can secure my session on shared devices**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I click the logout button
**Then** my session is destroyed
**And** I am redirected to the landing page
**And** I cannot access protected routes without logging in again

---

### Story 1.5: Password Reset via Email

As a **user who forgot my password**,
I want **to reset my password via email**,
So that **I can regain access to my account**.

**Acceptance Criteria:**

**Given** I am on the forgot password page
**When** I enter my registered email
**Then** a password reset link is sent to my email
**And** I see a message "Check your email for reset instructions"

**Given** I click a valid reset link
**When** I enter a new password
**Then** my password is updated
**And** I am redirected to login with a success message

**Given** the reset link has expired (24 hours)
**When** I click it
**Then** I see an error "Reset link has expired"

---

## Epic 2: Game Creation & Configuration — Stories

### Story 2.1: Database Schema for Games & Patterns

As a **developer**,
I want **the game and pattern database schema defined**,
So that **game creation can persist data correctly**.

**Acceptance Criteria:**

**Given** Prisma is configured
**When** migrations are run
**Then** a `Game` table exists with fields: id, title, hostId, status, numberInterval, minPlayers, maxPlayers, createdAt
**And** a `GamePattern` table exists linking games to enabled patterns with point values
**And** a `Pattern` enum/table defines the 6 default patterns (FirstRow, SecondRow, ThirdRow, EarlyFive, FourCorners, FullHouse)
**And** pattern variants support tiered points (1st, 2nd, 3rd claimers)

---

### Story 2.2: Create Game with Title

As a **host**,
I want **to create a new game with a custom title**,
So that **my players can identify the game**.

**Acceptance Criteria:**

**Given** I am logged in and on the create game page
**When** I enter a game title (1-100 chars) and submit
**Then** a new game is created with status "CONFIGURING"
**And** I am redirected to the game configuration page
**And** the game is associated with my user ID as host

**Given** I enter an empty or too-long title
**When** I submit
**Then** I see a validation error

---

### Story 2.3: Configure Prize Patterns

As a **host**,
I want **to select which patterns are enabled and set their point values**,
So that **I can customize the prizes for my game**.

**Acceptance Criteria:**

**Given** I am on the game configuration page
**When** I toggle patterns on/off
**Then** the selected patterns are saved for this game
**And** at minimum, Full House must be enabled (cannot be disabled)

**Given** I set point values for each pattern
**When** I save the configuration
**Then** each pattern has its configured point value stored

**Given** I configure pattern variants (1st/2nd/3rd claimer points)
**When** I save
**Then** the tiered point values are stored for each pattern

---

### Story 2.4: Configure Game Settings

As a **host**,
I want **to set the number calling interval and player limits**,
So that **the game pace matches my audience**.

**Acceptance Criteria:**

**Given** I am on the game configuration page
**When** I select a number interval (7s, 10s, or 15s)
**Then** the interval is saved for this game

**Given** I set min players (2-75) and max players (2-75)
**When** min ≤ max and both are in valid range
**Then** the limits are saved

**Given** I enter invalid limits (min > max or out of range)
**When** I try to save
**Then** I see a validation error

---

### Story 2.5: Generate Shareable Link & Game Code

As a **host**,
I want **a shareable link and 6-digit code for my game**,
So that **I can invite players easily**.

**Acceptance Criteria:**

**Given** I have configured my game
**When** I click "Generate Invite"
**Then** a unique 6-digit alphanumeric code is generated
**And** a shareable URL is created: `/game/{gameId}`
**And** both are displayed with copy-to-clipboard buttons

**Given** the code is generated
**When** I view the game dashboard
**Then** I can see and copy the code/link at any time

---

### Story 2.6: Host Dashboard with Game List

As a **host**,
I want **to see all my created games on my dashboard**,
So that **I can manage them**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to the dashboard
**Then** I see a list of all games I've created
**And** each game shows: title, status, player count, created date
**And** I can click "Create New Game" to start a new game

**Given** I have no games
**When** I view the dashboard
**Then** I see an empty state with a prompt to create my first game

---

## Epic 3: Game Lobby & Player Joining — Stories

### Story 3.1: Tambola Ticket Generator Logic

As a **developer**,
I want **a robust utility to generate valid Tambola tickets**,
So that **every player gets a correct 3x9 grid ticket**.

**Acceptance Criteria:**

**Given** the ticket generator is called
**When** generating a ticket
**Then** it returns a 3x9 grid structure
**And** each row has exactly 5 numbers (15 total numbers)
**And** each column has numbers within specific ranges (Col 1: 1-9, Col 2: 10-19... Col 9: 80-90)
**And** numbers are sorted in ascending order within columns
**And** no duplicate numbers exist
**And** the generator runs efficiently (fast enough for bulk generation if needed)

---

### Story 3.2: Player Joining API & Ticket Assignment

As a **player**,
I want **to join a game using a code or link and get a ticket**,
So that **I can participate in the game**.

**Acceptance Criteria:**

**Given** I access a game link or enter a code
**When** I submit my name (or auto-filled if logged in)
**Then** I am added to the game's player list
**And** a unique ticket is generated and assigned to me via Story 3.1 logic
**And** I am returned a session/access token for this game (cookie/local storage)

**Given** the game is full (Max players reached)
**When** I try to join
**Then** I see an error "Game is full"

**Given** the game has already started
**When** I try to join
**Then** I enter in "Spectator" mode (or Late Join if allowed - handled in Epic 6, for now just join flow)

---

### Story 3.3: Real-time Lobby & Player Count

As a **host**,
I want **to see players joining in real-time**,
So that **I know when everyone is ready**.

**Acceptance Criteria:**

**Given** I am in the lobby (Host or Player)
**When** a new player joins via Story 3.2
**Then** the player count updates instantly via Pusher event `player:joined`
**And** the new player's name appears in the list

**Given** I am a player
**When** I join the lobby
**Then** I see the Game Title, Host Name, and Game Rules (Pattern points)
**And** I can see my assigned ticket visualization

---

### Story 3.4: Host Start Game Control

As a **host**,
I want **to start the game when valid**,
So that **actual gameplay begins**.

**Acceptance Criteria:**

**Given** I am the host
**And** the minimum player count (2) is met
**When** I click "Start Game"
**Then** the game status updates to "STARTED" in DB
**And** a `game:started` event is broadcast via Pusher
**And** all connected clients redirect automatically to the `/play` page

**Given** minimum players are not met
**When** I view the dashboard
**Then** the Start button is disabled with a message

---

## Epic 4: Live Gameplay — Number Calling & Ticket Marking — Stories

### Story 4.1: Game Loop & Number Generator

As a **developer**,
I want **a secure server-side game loop**,
So that **numbers are called fairly and at the right interval**.

**Acceptance Criteria:**

**Given** the game has started
**When** the configured interval (e.g., 10s) passes
**Then** the server randomly selects a number from 1-90 that hasn't been called yet
**And** the number is saved to the `Game` state in the DB/Redis
**And** the number is broadcast via Pusher event `number:called` payload: `{ number: 42, sequence: 1 }`

**Given** all 90 numbers have been called
**When** the loop continues
**Then** the game automatically ends via `game:ended` event

---

### Story 4.2: Real-time Number Display & Announcement

As a **player**,
I want **to see and hear the number as soon as it's called**,
So that **I can check my ticket**.

**Acceptance Criteria:**

**Given** I am on the `/play` screen
**When** a `number:called` event arrives
**Then** the large number display updates with a specialized animation (e.g., pop/scale)
**And** the text-to-speech audio announces "Four Two. Forty Two."
**And** the number is added to the "Last called" history bar

**Given** I want to play quietly
**When** I toggle the Mute button
**Then** the audio announcements stop but visual updates continue

---

### Story 4.3: Interactive Ticket Marking

As a **player**,
I want **to mark numbers on my ticket**,
So that **I can track my progress**.

**Acceptance Criteria:**

**Given** I see my ticket on screen
**When** I tap a number
**Then** the number cell toggles state (Marked/Unmarked) instantly
**And** the change is persisted to the server immediately ("Sync on Mark")

**Given** I mark a number that hasn't been called yet
**When** I tap it
**Then** it marks successfully (Player responsibility to mark correctly)

---

### Story 4.4: Called Comparison & History

As a **player**,
I want **to see the history of called numbers**,
So that **I can manually verify if I missed one**.

**Acceptance Criteria:**

**Given** play is in progress
**When** a number is called
**Then** it appears in the "Last 10 Numbers" history bar

**Given** I missed a number
**When** I check the history bar
**Then** I can see which numbers were recently called
**And** NO automatic highlighting or hints appear on my ticket (I must find it myself)
**And** NO visual indicators show "Missed" numbers on the ticket

---

## Epic 5: Claims & Game Completion — Stories

### Story 5.1: Claim Verification Logic

As a **developer**,
I want **a robust server-side verification function**,
So that **only valid claims are awarded**.

**Acceptance Criteria:**

**Given** a user claims a specific pattern (e.g., First Row)
**When** the verification function runs
**Then** it checks if that pattern is already claimed (if only 1 winner allowed)
**And** it verifies the user's ticket numbers for that pattern are ALL marked
**And** it verifies all those marked numbers have actually been CALLED by the server
**And** it returns VALID or INVALID status accurately

---

### Story 5.2: Initiating a Claim

As a **player**,
I want **to claim a prize when I complete a pattern**,
So that **I can win points**.

**Acceptance Criteria:**

**Given** I believe I have completed a pattern
**When** I click the "Claim Prize" button
**Then** I see a list of available patterns (e.g., Early 5, Rows, Full House)
**And** I can select the one I want to claim
**And** the claim request is sent to the server immediately

**Given** I make a claim
**When** I wait for the result
**Then** the UI shows a "Verifying..." spinner (NFR4 interaction speed)

---

### Story 5.3: Claim Result & Announcement

As a **player**,
I want **to know if my claim was successful**,
So that **I get credit for my win**.

**Acceptance Criteria:**

**Given** my claim is VALID
**When** the server processes it
**Then** I see a "Congratulations!" success animation
**And** a global announcement is broadcast to ALL players: "{Player} claimed {Pattern}!"
**And** my score updates on the leaderboard

**Given** my claim is INVALID (Bogus claim)
**When** the server processes it
**Then** I see a simple error message: "Invalid Claim"
**And** NO global announcement is made (to avoid spam)
**And** I cannot spam claims (cooldown of 3-5 seconds applied)

---

### Story 5.4: Pattern Completion & Leaderboard

As a **player**,
I want **to see which prizes are still available**,
So that **I know what to aim for**.

**Acceptance Criteria:**

**Given** a pattern has been claimed by the max number of winners (usually 1)
**When** the claim is confirmed
**Then** that pattern is marked as "CLOSED" or "CLAIMED" in the prize list for everyone
**And** the Live Leaderboard updates with the winner's name and points

---

### Story 5.5: Game Completion (Full House & Force Stop)

As a **host**,
I want **the game to end when Full House is claimed OR when I force stop it**,
So that **we can see the final winners**.

**Acceptance Criteria:**

**Given** a player successfully claims "Full House"
**When** the claim is verified
**Then** the game state changes to "COMPLETED"
**And** the number calling loop stops
**And** a `game:ended` event is sent to all clients
**And** everyone sees the Final Leaderboard screen with all winners listed

**Given** I am the host and want to end the game early
**When** I click "End Game" in the host controls
**Then** the game ends immediately for all players

---

### Story 5.6: UI Layout Consistency & Navigation Patterns

As a **user** (both host and player),
I want **consistent layouts, navigation patterns, and visual hierarchy across all pages**,
So that **the application feels cohesive and I can navigate intuitively**.

**Acceptance Criteria:**

**Given** I navigate between different pages (Dashboard, Lobby, Game Play)
**When** I view any page
**Then** I see a consistent header structure with logo and contextual information
**And** page titles follow the same typography and positioning
**And** content areas use consistent max-width containers and spacing

**Given** I am on a host page (Dashboard, Game Configuration, Host Controls)
**When** I view the page
**Then** I see a HostLayout with consistent navigation elements
**And** I have access to "Back to Dashboard" navigation where appropriate
**And** critical actions (Create Game, Start Game, End Game) use consistent button styling

**Given** I am on a player page (Lobby, Game Play)
**When** I view the page
**Then** I see a PlayerLayout with consistent structure
**And** the game code is always visible in the header
**And** I have access to "Leave Game" functionality in a consistent location

**Given** I am viewing any game-related page
**When** the page loads
**Then** I see consistent card/container styling with uniform padding and borders
**And** section headers use the same typography hierarchy (h1, h2, h3)
**And** spacing between sections follows a consistent scale (using design tokens)

**Given** I interact with navigation elements
**When** I click back buttons, breadcrumbs, or navigation links
**Then** they behave predictably and maintain visual consistency
**And** the current page/context is always clear from the UI

**Technical Implementation Notes:**

- Create layout components: `BaseLayout.tsx`, `HostLayout.tsx`, `PlayerLayout.tsx`, `GameLayout.tsx`
- Create navigation components: `AppHeader.tsx`, `GameCodeDisplay.tsx`, `BackButton.tsx`
- Create page wrapper components: `PageHeader.tsx`, `PageContent.tsx`
- Refactor existing pages to use new layout system
- Ensure design tokens from `globals.css` are consistently applied
- Maintain responsive behavior across all layouts

---

## Epic 6: Resilience & Game History — Stories

### Story 6.1: Reconnection & Mid-Game Recovery

As a **player who lost connection**,
I want **to rejoin the game exactly where I left off**,
So that **I don't lose my chance to win**.

**Acceptance Criteria:**

**Given** I am in an active game and lose internet or refresh
**When** I reconnect or reload the page
**Then** the game automatically detects my active session
**And** it fetches the current game state (Last called number, My ticket marks, Claim status)
**And** I am synced up immediately without losing my ticket state

**Given** I missed 3 numbers while disconnected
**When** I rejoin
**Then** those 3 numbers appear in the history bar for me to catch up
**And** I can mark them on my ticket manually as "valid"

---

### Story 6.2: Mid-Game Joining Restricted

As a **host**,
I want **to prevent new players from joining after the game starts**,
So that **games remain fair and manageable**.

**Acceptance Criteria:**

**Given** a game is "STARTED"
**When** a new user attempts to join via link or code
**Then** they are BLOCKED from joining
**And** they see a message: "Game has already started. You cannot join now."
**And** (Optional Future) They can join as a "Spectator" only (No ticket)

**Note:** This invalidates FR38 ("Players can join a game in progress") based on User Decision to prioritize fairness/simplicity.

---

### Story 6.3: Basic Game History

As a **user**,
I want **to see a list of games I've played**,
So that **I can remember my wins**.

**Acceptance Criteria:**

**Given** I am on the dashboard
**When** I click "History" or "Past Games"
**Then** I see a list of completed games I participated in
**And** each item shows: Date, Game Name, Host, and My Status (Won/Lost)
