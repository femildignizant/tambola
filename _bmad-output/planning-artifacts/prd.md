---
stepsCompleted: [1, 2, 3, 4, 7, 8, 9, 10, 11]
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-tambola-2026-01-05.md"
  - "_bmad-output/analysis/brainstorming-session-2026-01-05.md"
  - "_bmad-output/project-context.md"
workflowType: "prd"
lastStep: 11
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 1
---

# Product Requirements Document - Tambola

**Author:** femil
**Date:** 2026-01-06

## Executive Summary

**Tambola** is an online multiplayer Housie game that transforms the traditional party favorite into a seamless digital experience. The platform enables hosts to go from idea to live game in under 5 minutes — no tickets to print, no numbers to track, no claims to verify manually.

Built for remote teams and distributed families, Tambola brings the joy of this beloved game to the digital age with real-time synchronization, automatic number calling, instant claim verification, and rich customization options.

### Problem Statement

Playing Tambola remotely today is either **impractical or clunky**:

- **Physical games** require extensive preparation: printing tickets, distributing them, manual number calling, and hand-verifying claims
- **Remote alternatives** are makeshift — video calls with screen sharing, no individual tickets, and manual tracking that breaks the flow

For HR teams organizing virtual team-building or families spread across cities, there's no simple way to run a proper Tambola game online.

### What Makes This Special

| Differentiator                  | Why It Matters                                                        |
| ------------------------------- | --------------------------------------------------------------------- |
| **"Idea to game in 5 minutes"** | Eliminates all physical prep work — spontaneous games become possible |
| **Custom configurations**       | Hosts own the experience — patterns, points, speed all adjustable     |
| **Real-time multiplayer**       | Pusher-powered sync means everyone shares the moment together         |
| **Auto-verification**           | Claims are instantly validated — no arguments, no errors              |
| **Free-tier architecture**      | NeonDB + Pusher + Upstash = production-ready at zero cost             |

## Project Classification

| Dimension           | Value                                                               |
| ------------------- | ------------------------------------------------------------------- |
| **Technical Type**  | Web Application (Real-time Multiplayer)                             |
| **Domain**          | General (Social Entertainment)                                      |
| **Complexity**      | Low                                                                 |
| **Project Context** | Greenfield with technical context defined                           |
| **Tech Stack**      | Next.js (App Router) + NeonDB + Pusher + Upstash Redis + BetterAuth |

## Success Criteria

### User Success

**Host Success Moments:**

- ✅ **"It just works"** — Game created, configured, and shareable link ready in under 5 minutes
- ✅ **"Everyone's in"** — All invited players join the lobby without technical issues
- ✅ **"Zero intervention"** — Numbers auto-call, claims auto-verify, game ends cleanly on Full House
- ✅ **"Let's do it again!"** — Host returns to create another game

**Player Success Moments:**

- ✅ **"I have my own ticket!"** — Sees personal digital ticket immediately upon joining
- ✅ **"It's so easy"** — Tap to mark, tap to claim — no learning curve
- ✅ **"That was fair"** — Claims verified instantly, no disputes

### Business Success

| Metric               | 3-Month Target            | 12-Month Vision           |
| -------------------- | ------------------------- | ------------------------- |
| **Games Created**    | 500 games                 | 5,000 games               |
| **Registered Users** | 1,000 users               | 10,000 users              |
| **Avg Players/Game** | 15+ players               | 25+ players               |
| **Host Return Rate** | 30% hosts create 2+ games | 50% hosts create 3+ games |

### Technical Success

| Metric                  | Target                                                                 |
| ----------------------- | ---------------------------------------------------------------------- |
| **Real-time Latency**   | < 2 seconds for number broadcast                                       |
| **Claim Resolution**    | < 500ms first-come-first-served                                        |
| **Uptime**              | 99% during active games                                                |
| **Free Tier Viability** | Operate within Pusher/Upstash/NeonDB free limits for first 1,000 users |

### Measurable Outcomes

1. **Time to First Game**: Host creates and starts first game in < 5 minutes
2. **Join Success Rate**: 95%+ of invited players successfully join
3. **Claim Accuracy**: 100% correct claim verification (no false positives/negatives)
4. **Game Completion Rate**: 90%+ games reach Full House without errors

## Product Scope

### MVP - Minimum Viable Product (18 Features)

| #   | Feature                          | Priority |
| --- | -------------------------------- | -------- |
| 1   | Game Creation (title + settings) | Must     |
| 2   | Pattern Selection (6 default)    | Must     |
| 3   | Pattern Variants (tiered points) | Must     |
| 4   | Points Configuration             | Must     |
| 5   | Number Interval (7s/10s/15s)     | Must     |
| 6   | Min/Max Players (2-75)           | Must     |
| 7   | Invite System (code + link)      | Must     |
| 8   | 1 Ticket per Player              | Must     |
| 9   | Auto Number Calling              | Must     |
| 10  | Animated Number Reveal + Sound   | Must     |
| 11  | Manual Marking (tap to mark)     | Must     |
| 12  | Limited History (last 10)        | Must     |
| 13  | Claim System (auto-verify)       | Must     |
| 14  | Pattern Status Display           | Must     |
| 15  | Auto End (Full House)            | Must     |
| 16  | Leaderboard (final standings)    | Must     |
| 17  | Game History                     | Must     |
| 18  | BetterAuth (email/password)      | Must     |

### Growth Features (Post-MVP)

| Feature                 | Rationale                                        |
| ----------------------- | ------------------------------------------------ |
| **Floating Reactions**  | Social engagement enhancement — moved from MVP   |
| **Multiple Tickets**    | Allow 1-5 tickets per player (host configurable) |
| **Additional Patterns** | Beyond core 6 patterns                           |
| **Sound Customization** | Custom number announcement voices                |

### Vision (Future)

- **Custom Themes** — Branded games for corporate events
- **Tournament Mode** — Multi-game series with cumulative scores
- **Spectator Mode** — Watch games without playing
- **Mobile Apps** — Native iOS/Android for better experience

## User Journeys

### Journey 1: Priya Sharma — The Corporate Event Hero

**Who She Is:**
Priya is an HR Manager at a 200-person tech company. Her team is spread across Mumbai, Bangalore, and remote locations. Every quarter, she organizes a virtual team-building event, and Tambola is always the crowd favorite — except she dreads the preparation.

**Her Story:**
It's Friday afternoon, and Priya's boss just asked if she can run a quick Tambola session for the team's Diwali celebration next week. In the past, this meant spending her weekend printing 50 tickets, creating a Google Sheet to track numbers, and enlisting a colleague to help verify claims during the chaos.

This time, Priya discovers Tambola online. She signs up in 30 seconds with her email, and immediately sees a clean "Create Game" button. She enters "Acme Diwali Tambola 2026" as the title, keeps the default 6 patterns (First Row, Second Row, Third Row, Early Five, Four Corners, Full House), and sets the number calling interval to 10 seconds — just right for her mixed-age team.

Within 3 minutes, she has a shareable link and a 6-digit code. She drops both into the company Slack channel with a simple message: _"Join us for Diwali Tambola! 🎲"_

**The Game Day:**
On Tuesday at 4 PM, Priya opens the game dashboard and watches players join in real-time. "12 joined... 28... 47!" When she hits 50 players, she clicks "Start Game."

The first number — **42** — appears with a satisfying animation. She doesn't have to do anything. Numbers call themselves every 10 seconds. When Ramesh from the Bangalore office claims "First Row," the system verifies it instantly and announces to everyone: _"🎉 Ramesh wins First Row!"_

When Meera finally claims Full House 20 minutes later, the game ends automatically with a beautiful leaderboard showing everyone's points.

**The Outcome:**
Priya's boss messages her: _"That was the smoothest Tambola we've ever done. Same time next month?"_ Priya smiles — she spent 5 minutes setting up instead of 5 hours.

**Journey Requirements Revealed:**

- Account creation (email/password)
- Game creation with title and settings
- Pattern and points configuration
- Shareable link + code generation
- Real-time player count in lobby
- Start game control
- Auto number calling with animation
- Automatic claim verification
- Real-time announcements
- Auto game-end on Full House
- Leaderboard display

---

### Journey 2: Vikram Mehta — The Remote Family Connector

**Who He Is:**
Vikram is a 35-year-old software engineer in San Francisco. His parents are in Delhi, his sister's family is in London, and his cousins are scattered across India. During Diwali, they all want to celebrate together, but the 12-hour time zone difference makes it hard.

**His Story:**
It's 9 AM Saturday in San Francisco (9:30 PM in Delhi, perfect!) and the family WhatsApp group is buzzing about playing Tambola like they used to during childhood. Vikram's mom, who barely uses WhatsApp, is skeptical: _"Beta, I won't understand these computer games."_

Vikram creates a game on Tambola, sets a slower 15-second interval for his mom, and shares the link. His mom clicks it, enters her name "Sunita Didi," and suddenly sees her own ticket — just like the paper ones she remembers, with the same 3 rows and familiar 1-90 numbers.

**The Game:**
When **23** is called, the number appears with a gentle chime. Vikram's 8-year-old nephew in London shouts on the video call: "I have 23!" and taps it on his iPad. It highlights with a satisfying green checkmark.

15 minutes in, Vikram's mom claims "Early Five" — she tapped her 5 numbers and hit the Claim button. The system checks her ticket against the called numbers and announces: _"🎉 Sunita Didi wins Early Five!"_

She's beaming on the video call: _"Bilkul real Tambola jaisa lag raha hai!"_ (It feels just like real Tambola!)

**The Outcome:**
The family plays for 45 minutes until Vikram's cousin claims Full House. They're already planning next month's game. Vikram's mom — the biggest skeptic — asks him to teach her how to create a game for her kitty party.

**Journey Requirements Revealed:**

- Guest-friendly joining (minimal friction)
- Personal ticket generation
- Clear ticket display (familiar Tambola layout)
- Tap to mark numbers
- Audio/visual number announcements
- Claim button with pattern selection
- Instant verification feedback
- Winner announcements to all
- Simple, intuitive UI for all ages

---

### Journey 3: The Player Who Joins Late — Arjun's Catch-Up

**Who He Is:**
Arjun is a 28-year-old marketing associate at Priya's company. He got pulled into a last-minute meeting and missed the first 10 numbers of the Diwali Tambola.

**His Story:**
Arjun clicks the game link 8 minutes after the game started. Instead of being locked out, he joins instantly and sees his ticket with 10 numbers already highlighted as "called but not marked." The last 10 called numbers are visible in a history bar at the top.

He quickly scans his ticket, marks the numbers he has, and catches up within 30 seconds. When the next number is called, he's fully in sync with everyone else.

**The Challenge:**
He realizes he missed marking **17** and **42** — both on his ticket! He marks them quickly. When he tries to claim "First Row," the system checks and confirms he has all 5 numbers in that row. He wins Third Row instead (someone already claimed First) and gets 10 points as the second claimer.

**The Outcome:**
Despite joining late, Arjun finishes 4th on the leaderboard. He didn't feel excluded — the game handled his late arrival gracefully.

**Journey Requirements Revealed:**

- Mid-game join support
- Called numbers history (last 10)
- Visual distinction for "called but not marked"
- State sync on reconnect
- Pattern variant scoring (2nd/3rd claimers)

---

### Journey Requirements Summary

| Capability Area    | Key Requirements                                             |
| ------------------ | ------------------------------------------------------------ |
| **Authentication** | Email/password signup, quick login                           |
| **Game Creation**  | Title, patterns, points, interval, player limits             |
| **Invitation**     | Shareable link + 6-digit code                                |
| **Lobby**          | Real-time player count, start game control                   |
| **Ticket**         | Standard Tambola format, tap to mark, personal per player    |
| **Number Calling** | Auto-call at interval, animation, sound (mutable)            |
| **History**        | Last 10 numbers visible                                      |
| **Claims**         | Pattern selection, instant verification, multi-tier variants |
| **Announcements**  | Real-time winner broadcasts to all players                   |
| **Game End**       | Auto-end on Full House, leaderboard display                  |
| **Resilience**     | Mid-game join, reconnection support, state sync              |

## Web Application Specific Requirements

### Architecture Overview

| Aspect                 | Decision                                       |
| ---------------------- | ---------------------------------------------- |
| **Rendering Strategy** | SPA with SSR (Next.js App Router)              |
| **Real-time Layer**    | Pusher Channels for multiplayer sync           |
| **UI Framework**       | shadcn/ui (Radix UI primitives + Tailwind CSS) |
| **State Management**   | React Server Components + Client-side hooks    |

### Browser Support Matrix

| Browser       | Minimum Version | Priority |
| ------------- | --------------- | -------- |
| Chrome        | Last 2 versions | Primary  |
| Firefox       | Last 2 versions | Primary  |
| Safari        | Last 2 versions | Primary  |
| Edge          | Last 2 versions | Primary  |
| Mobile Chrome | Last 2 versions | Primary  |
| Mobile Safari | Last 2 versions | Primary  |

**Not Supported:** IE11, Legacy Edge, Safari < 14

### Responsive Design

| Breakpoint | Target Devices | Priority                |
| ---------- | -------------- | ----------------------- |
| Mobile     | 320px - 767px  | High (primary gameplay) |
| Tablet     | 768px - 1023px | Medium                  |
| Desktop    | 1024px+        | Medium (host dashboard) |

**Mobile-First Approach:** Players primarily use mobile devices during games. Ticket marking and claim buttons must be touch-optimized.

### SEO Strategy

| Page         | SEO Priority | Strategy                             |
| ------------ | ------------ | ------------------------------------ |
| Landing Page | High         | Full SSR, meta tags, structured data |
| Game Pages   | None         | Dynamic routes, no indexing needed   |
| Auth Pages   | Low          | Basic meta tags only                 |

**robots.txt:** Block indexing of `/game/*` routes to prevent stale game links in search results.

### Performance Targets

| Metric                             | Target  | Measurement      |
| ---------------------------------- | ------- | ---------------- |
| **LCP** (Largest Contentful Paint) | < 2.5s  | Landing page     |
| **FID** (First Input Delay)        | < 100ms | Game interaction |
| **CLS** (Cumulative Layout Shift)  | < 0.1   | All pages        |
| **Real-time Latency**              | < 2s    | Number broadcast |
| **Initial Load**                   | < 3s    | Lobby join       |

### Accessibility Level

| Standard                | Target                             |
| ----------------------- | ---------------------------------- |
| **WCAG Level**          | Basic (via shadcn/ui defaults)     |
| **Keyboard Navigation** | All interactive elements           |
| **Screen Readers**      | Basic labels on buttons and inputs |
| **Color Contrast**      | Meets AA ratios (shadcn defaults)  |
| **Focus States**        | Visible focus rings                |

**Note:** shadcn/ui built on Radix UI provides accessibility primitives out of the box. No additional WCAG audit required for MVP.

### Real-time Architecture

| Component            | Technology                       | Purpose                            |
| -------------------- | -------------------------------- | ---------------------------------- |
| **Number Broadcast** | Pusher `game-{id}` channel       | Sync called numbers to all players |
| **Claim Events**     | Pusher trigger                   | Announce verified claims           |
| **Player Count**     | Pusher presence                  | Live lobby count                   |
| **Reconnection**     | Pusher auto-reconnect + API sync | State recovery                     |

### Implementation Stack Summary

| Layer             | Technology               |
| ----------------- | ------------------------ |
| **Framework**     | Next.js 16+ (App Router) |
| **UI Components** | shadcn/ui                |
| **Styling**       | Tailwind CSS             |
| **Auth**          | BetterAuth               |
| **Database**      | NeonDB (PostgreSQL)      |
| **Real-time**     | Pusher Channels          |
| **Caching/Locks** | Upstash Redis            |
| **Hosting**       | Vercel                   |

## Risk Mitigation

| Risk Type     | Key Risk                  | Mitigation Strategy                                               |
| ------------- | ------------------------- | ----------------------------------------------------------------- |
| **Technical** | Real-time sync at scale   | Pusher handles scaling; test edge cases (reconnection, late join) |
| **Technical** | Race conditions on claims | Redis SETNX atomic locking; test concurrent claim scenarios       |
| **Market**    | Low host return rate      | Optimize for <5 min setup; track as key metric                    |
| **Resource**  | Free tier limits          | Monitor Pusher/Upstash usage; design for upgrade path             |
| **UX**        | Tech-resistant users      | Mobile-first design; intuitive tap-to-mark; minimal onboarding    |

## Functional Requirements

### Authentication & User Management

- FR1: Users can create an account with email and password
- FR2: Users can log in with their credentials
- FR3: Users can log out of their account
- FR4: Users can reset their password via email

### Game Creation & Configuration

- FR5: Hosts can create a new game with a custom title
- FR6: Hosts can select which prize patterns are enabled for their game
- FR7: Hosts can configure point values for each prize pattern
- FR8: Hosts can configure pattern variants with tiered points (1st, 2nd, 3rd claimers)
- FR9: Hosts can set the number calling interval (7s, 10s, or 15s)
- FR10: Hosts can set minimum and maximum player limits (2-75)
- FR11: Hosts can generate a shareable game link
- FR12: Hosts can view a unique 6-digit game code for sharing

### Game Lobby

- FR13: Players can join a game via shareable link
- FR14: Players can join a game by entering a 6-digit code
- FR15: Players can see their assigned ticket upon joining
- FR16: Players can see the game title and settings in the lobby
- FR17: Hosts can see real-time player count in the lobby
- FR18: Hosts can start the game when minimum players have joined

### Gameplay - Number Calling

- FR19: The system automatically calls numbers at the configured interval
- FR20: All players see the called number with visual animation
- FR21: All players hear an audio announcement (if unmuted)
- FR22: Players can mute/unmute sound during gameplay
- FR23: Players can see the last 10 called numbers in history

### Gameplay - Ticket Interaction

- FR24: Players can see their personal ticket in standard Tambola format (3 rows × 9 columns)
- FR25: Players can tap/click numbers on their ticket to mark them
- FR26: Players can see visual feedback when a number is marked
- FR27: Players can see which numbers on their ticket have been called but not yet marked

### Gameplay - Claims

- FR28: Players can initiate a claim at any time during gameplay
- FR29: Players can select which pattern they are claiming
- FR30: The system automatically verifies if the claim is valid
- FR31: Valid claims are awarded points according to the pattern configuration
- FR32: Valid claims are announced to all players in real-time
- FR33: Invalid claims show an error message to the claiming player
- FR34: Players can see which patterns have already been claimed

### Game Completion

- FR35: The game automatically ends when Full House is claimed
- FR36: All players see the final leaderboard with scores upon game end
- FR37: Hosts can see the final results summary

### Resilience & State Management

- FR38: Players can join a game in progress (mid-game join)
- FR39: Players who disconnect can rejoin and recover their game state
- FR40: The system syncs game state for reconnecting players

### Game History

- FR41: Users can view their past games
- FR42: Users can see their performance in past games

### Prize Patterns (MVP)

- FR43: The system supports First Row pattern
- FR44: The system supports Second Row pattern
- FR45: The system supports Third Row pattern
- FR46: The system supports Early Five pattern
- FR47: The system supports Four Corners pattern
- FR48: The system supports Full House pattern

## Non-Functional Requirements

### Performance

| Metric                       | Target      | Context                                         |
| ---------------------------- | ----------- | ----------------------------------------------- |
| **Number Broadcast Latency** | < 2 seconds | All players see number within 2s of server call |
| **Claim Resolution**         | < 500ms     | First-come-first-served must be instant         |
| **Page Load (Lobby)**        | < 3 seconds | Players must join quickly from invite link      |
| **Interaction Response**     | < 100ms     | Tap-to-mark must feel instant                   |
| **Leaderboard Update**       | Real-time   | Scores update immediately on valid claims       |

### Reliability

| Metric                         | Target         | Context                                     |
| ------------------------------ | -------------- | ------------------------------------------- |
| **Uptime During Active Games** | 99%            | Games in progress must not fail             |
| **State Persistence**          | 100%           | No data loss on disconnect/reconnect        |
| **Graceful Degradation**       | Required       | Show meaningful errors, never blank screens |
| **Pusher Failover**            | Auto-reconnect | Automatic reconnection on connection drop   |

### Security

| Requirement            | Implementation                                       |
| ---------------------- | ---------------------------------------------------- |
| **Authentication**     | BetterAuth with email/password (no OAuth for MVP)    |
| **Session Management** | Server-side sessions, secure cookies                 |
| **Server Authority**   | All game logic server-side; client cannot be trusted |
| **Claim Verification** | Server-only; never trust client claim data           |
| **Ticket Generation**  | Server-only; tickets stored in database              |
| **Data Protection**    | HTTPS only; no sensitive data stored beyond auth     |

### Scalability

| Metric                      | Target           | Context                                              |
| --------------------------- | ---------------- | ---------------------------------------------------- |
| **Concurrent Players/Game** | 75 max           | Per MVP player limit                                 |
| **Concurrent Games**        | 50+              | Free tier should support 50+ simultaneous games      |
| **User Growth**             | 1,000 users      | Free tier viability for first 1,000 registered users |
| **Pusher Connections**      | Within free tier | 100 concurrent connections (Pusher free)             |
| **Database Size**           | Within free tier | NeonDB free tier limits                              |

### Maintainability

| Requirement           | Implementation                        |
| --------------------- | ------------------------------------- |
| **Code Organization** | Feature-based folder structure        |
| **Type Safety**       | Full TypeScript coverage              |
| **Logging**           | Structured logging for debugging      |
| **Error Monitoring**  | Integration-ready (Sentry or similar) |
