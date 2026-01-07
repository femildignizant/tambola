---
stepsCompleted: [1, 2, 3]
inputDocuments: []
session_topic: "Tambola Online Multiplayer Game - Features & Real-time Technical Architecture"
session_goals: "1. Generate innovative game features 2. Identify technical constraints/solutions for real-time multiplayer"
selected_approach: "hybrid-user-selected-ai-recommended"
techniques_used: ["constraint-mapping", "scamper", "role-playing"]
ideas_generated: []
context_file: "_bmad-output/planning-artifacts/bmm-workflow-status.yaml"
---

# Brainstorming Session Results

**Facilitator:** femil
**Date:** 2026-01-05

## Session Overview

**Topic:** Tambola Online Multiplayer Game - Features & Real-time Technical Architecture

**Goals:**

1. Generate innovative game features
2. Identify technical constraints and solutions for real-time multiplayer

### Context Guidance

- **Project:** Online multiplayer Tambola game
- **Tech Stack:** Next.js Full Stack
- **Audience:** Everyone (General Public)
- **Key Features Baseline:** Host game creation, online player joining, real-time multiplayer, number calling & ticket marking

### Session Setup

**Approach Selected:** Hybrid (User-Selected + AI-Recommended Techniques)

---

## Technique Selection

**Selected Techniques (in order):**

1. 🗺️ Constraint Mapping - Technical limitations
2. 🔧 SCAMPER - Systematic feature generation
3. 🎭 Role Playing - Host/Player perspectives

---

## 🗺️ Technique 1: Constraint Mapping Results

### Constraint Summary Table

| Category     | Constraint          | Value               | Status                        |
| ------------ | ------------------- | ------------------- | ----------------------------- |
| Players      | Concurrent per game | 10-50               | ✅ Manageable                 |
| Latency      | Tolerance           | 1-5 seconds         | ✅ Very forgiving for Tambola |
| Real-time    | Technology          | SSE + Pusher        | ⚠️ See recommendations        |
| Hosting      | Platform            | Vercel (Serverless) | ✅ Free tier available        |
| Database     | Primary             | NeonDB (Postgres)   | ✅ Free tier                  |
| Real-time DB | Optional            | Pusher / Upstash    | ✅ Free tiers                 |
| Tickets      | Generation          | Server-side         | ✅ Secure                     |
| Budget       | Target              | Free tier priority  | ✅ Achievable                 |
| Skills       | Developer           | Software developer  | ✅ No blockers                |

---

### 📡 Real-Time Technology Analysis

#### SSE vs WebSocket vs Pusher for Next.js on Vercel

| Technology    | Next.js Support   | Vercel Support     | Free Tier       | Best For                 |
| ------------- | ----------------- | ------------------ | --------------- | ------------------------ |
| **SSE**       | ✅ Native         | ⚠️ 30s timeout     | ✅ Free         | Simple one-way updates   |
| **WebSocket** | ⚠️ Via API routes | ❌ Not supported   | N/A             | Not viable on Vercel     |
| **Pusher**    | ✅ Excellent      | ✅ Works perfectly | ✅ 200k msg/day | Bi-directional real-time |
| **Ably**      | ✅ Excellent      | ✅ Works perfectly | ✅ 6M msg/month | Similar to Pusher        |

**🎯 RECOMMENDATION: Use Pusher Channels**

**Why:**

- Vercel serverless doesn't support persistent WebSocket connections
- SSE has 30-second timeout on Vercel (problematic for games)
- Pusher handles all real-time complexity with generous free tier
- Perfect for your 10-50 player games

**Architecture:**

```
[Host Action] → [Next.js API Route] → [Pusher] → [All Players]
                      ↓
                  [NeonDB]
```

---

### 🔢 Number Calling Synchronization Strategy

**Problem:** Ensure all 10-50 players see the same number at approximately the same time.

**Recommended Solution: Server-Authoritative with Pusher Broadcast**

```
Host clicks "Call Number"
        ↓
API Route: POST /api/game/call-number
        ↓
1. Generate/select next random number (server-side)
2. Store in NeonDB with timestamp
3. Broadcast via Pusher to game channel
        ↓
All clients receive simultaneously
```

**Key Design Decisions:**

1. **Server generates numbers** - Prevents manipulation
2. **Timestamp each call** - Audit trail and sync verification
3. **Single Pusher channel per game** - All players subscribe to `game-{gameId}`
4. **Optimistic UI** - Show number immediately on receive
5. **State reconciliation** - On reconnect, fetch full game state from API

---

### 🏁 Race Condition Handling for Claims

**Problem:** Multiple players claim "Full House" at the same millisecond.

**Strategy: First-Come-First-Served with Database Locking**

```sql
-- Using Postgres transaction with row locking
BEGIN;
SELECT * FROM claims
WHERE game_id = $1 AND prize_type = 'FULL_HOUSE'
FOR UPDATE SKIP LOCKED;

-- Only insert if no existing claim
INSERT INTO claims (game_id, user_id, prize_type, claimed_at)
SELECT $1, $2, 'FULL_HOUSE', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM claims WHERE game_id = $1 AND prize_type = 'FULL_HOUSE'
);
COMMIT;
```

**Implementation Options:**

| Approach                  | Complexity | Fairness        | Recommendation |
| ------------------------- | ---------- | --------------- | -------------- |
| **DB Transaction Lock**   | Medium     | ✅ True first   | ✅ Recommended |
| **Redis SETNX** (Upstash) | Low        | ✅ True first   | ✅ Alternative |
| **Optimistic Locking**    | Low        | ⚠️ May conflict | Backup option  |

**🎯 RECOMMENDATION: Use Upstash Redis for claim locking**

- Atomic SETNX operation
- Sub-millisecond latency
- Free tier: 10k commands/day (plenty for claims)

```typescript
// Pseudo-code
const claimed = await redis.setnx(`claim:${gameId}:fullhouse`, odId);
if (claimed) {
  // This player wins!
  await saveToNeonDB();
  await pusher.trigger(`game-${gameId}`, 'claim-accepted', {...});
} else {
  // Someone else already claimed
  return { error: 'Already claimed' };
}
```

---

### 🏗️ Recommended Tech Stack (All Free Tier)

| Layer             | Technology           | Free Tier Limit   |
| ----------------- | -------------------- | ----------------- |
| **Frontend**      | Next.js (App Router) | Unlimited         |
| **Hosting**       | Vercel               | 100GB bandwidth   |
| **Database**      | NeonDB (Postgres)    | 512MB storage     |
| **Real-time**     | Pusher Channels      | 200k messages/day |
| **Caching/Locks** | Upstash Redis        | 10k commands/day  |
| **Auth**          | NextAuth.js          | Unlimited         |

**Estimated Free Tier Capacity:**

- ~100 games/day with 30 players each
- ~3,000 number calls/day
- ~1,000 active users

---

### ⚠️ Identified Constraints & Mitigations

| Constraint            | Impact                           | Mitigation                   |
| --------------------- | -------------------------------- | ---------------------------- |
| Vercel 30s timeout    | Can't use SSE long-polling       | Use Pusher instead           |
| Pusher 200k/day limit | ~6,600 messages/hour             | Batch updates where possible |
| NeonDB cold starts    | First query slow (~500ms)        | Use connection pooling       |
| Serverless stateless  | Can't store game state in memory | Use Redis for hot state      |
| Free tier limits      | May hit limits with growth       | Design for upgrade path      |

---

### ✅ Constraint Mapping Complete

**Key Insights:**

1. Your 1-5s latency tolerance is VERY forgiving - Tambola doesn't need ultra-low latency
2. Pusher + Upstash + NeonDB is the winning free-tier stack for Vercel
3. Server-authoritative design prevents cheating
4. Redis SETNX solves race conditions elegantly

**Ready for next technique?** → SCAMPER Method for feature generation

---

## 🔧 Technique 2: SCAMPER Results

### S - SUBSTITUTE ✅

| Traditional         | Substituted With          | Decision               |
| ------------------- | ------------------------- | ---------------------- |
| Physical tickets    | Digital tickets           | ✅ Yes                 |
| Human caller only   | Auto-call mode option     | ✅ Yes (host option)   |
| Verbal announcement | Visual animations + sound | ✅ Yes (+ mute option) |
| Paper daubing       | Tap to mark               | ✅ Yes                 |
| Cash prizes         | Virtual points/tokens     | ✅ Yes (per pattern)   |
| Variable numbers    | Fixed 1-90                | ✅ Traditional         |

### C - COMBINE ✅

| Combination                  | Decision                                                              |
| ---------------------------- | --------------------------------------------------------------------- |
| Tambola + Chat               | ❌ No chat                                                            |
| Tambola + Floating Reactions | ✅ **Yes** - emoji reactions appear on all screens (like Google Meet) |
| Tambola + Leaderboards       | ❌ Not for MVP                                                        |
| Tambola + Achievements       | ❌ Not for MVP                                                        |

### A - ADAPT ✅

| Adaptation               | Decision |
| ------------------------ | -------- |
| Kahoot-style PIN joining | ❌ No    |
| Ludo King features       | ❌ No    |
| Houseparty lobbies       | ❌ No    |
| Wordle daily mode        | ❌ No    |
| Twitch spectator mode    | ❌ No    |

**Decision:** Keep it simple, traditional Tambola experience.

### M - MODIFY ✅

| Feature              | Configuration                                |
| -------------------- | -------------------------------------------- |
| **Players per game** | Min: 2, Max: 75 (host decides)               |
| **Speed modes**      | Standard (default), Fast, Slow - host option |
| **Prize patterns**   | Custom points per pattern (host configures)  |
| **Tickets per user** | 1-5 (default 1, host can customize max)      |
| **Number display**   | Number + Animation + Sound (user can mute)   |
| **Game duration**    | Until Full House claimed                     |

### P - PUT TO OTHER USES ✅

| Use Case                    | Priority   |
| --------------------------- | ---------- |
| **Corporate Team Building** | ✅ Primary |
| **Family Gatherings**       | ✅ Primary |
| Party Tambola               | Secondary  |
| Educational                 | ❌ No      |
| Fundraiser                  | ❌ No      |

### E - ELIMINATE ✅

| Feature                    | Decision                            |
| -------------------------- | ----------------------------------- |
| Guest play (no signup)     | ❌ Require registration             |
| Social auth (Google, etc.) | ❌ Email/password only (BetterAuth) |
| Email verification         | ❌ Skip for MVP                     |
| Global game listing        | ❌ Invite-only (code sharing)       |
| Detailed player profiles   | ❌ Minimal profile                  |
| Complex game modes         | ❌ Single mode for MVP              |
| Game replays               | ❌ No                               |
| **Game history**           | ✅ Keep (user can see past games)   |

### R - REVERSE/REARRANGE ✅

| Idea                 | Decision               |
| -------------------- | ---------------------- |
| Players call numbers | ❌ No - host/auto only |
| Negative Tambola     | ❌ No                  |
| Reverse order (90→1) | ❌ No                  |
| Team Tambola         | ❌ No                  |

---

### 🎯 SCAMPER Feature Summary

**Core MVP Features Confirmed:**

1. **Game Creation** - Host creates game with custom settings
2. **Invite-only Join** - Players join via code (no public listing)
3. **Custom Prize Patterns** - Host sets points per pattern
4. **Auto-call Option** - Standard/Fast/Slow speed modes
5. **Digital Tickets** - 1-5 per player (host configurable)
6. **Animated Number Reveal** - Visual + Sound (mutable)
7. **Tap to Mark** - Interactive ticket marking
8. **Floating Reactions** - Emojis visible to all players
9. **Game History** - Players see their past games
10. **Email/Password Auth** - BetterAuth, no social login

**Prize Patterns to Support:**

- First Line (Top Row)

```
- Second Line (Middle Row)
- Third Line (Bottom Row)
- Early Five (First 5 numbers marked)
- Four Corners
- Full House
- *(Additional standard patterns as feasible)*

---

## 🎭 Technique 3: Role Playing Results

### 👑 HOST Perspective - Complete Journey

#### 1. Game Creation Settings

| Setting | Configuration |
|---------|---------------|
| **Game Title** | Custom title (e.g., "Acme Corp Team Building") |
| **Patterns** | Select from list (6 default selected, can add/remove) |
| **Points** | Custom points per pattern |
| **Pattern Variants** | Multiple claimers with tiered points (see below) |
| **Number Interval** | 7s / 10s / 15s (3 options) |
| **Min Players** | Host sets minimum to start |
| **Max Players** | Host sets maximum allowed |

#### 2. Pattern Variant System (NEW FEATURE!)

Host can configure **tiered rewards** for same pattern:

| Pattern | 1st Claimer | 2nd Claimer | 3rd Claimer |
|---------|-------------|-------------|-------------|
| First Row | 15 points | 10 points | 5 points |
| Full House | 50 points | - | - |

*Example: First Row can have 3 variants - first 3 claimers get different points*

#### 3. Game Flow - Host

```

Create Game → Configure Settings → Get Code + Link
↓
Share via WhatsApp/any medium
↓
See Waiting Screen ("Waiting for players...")
↓
Player joins → Show player count
↓
Min players reached → "Start Game" button enabled
↓
Start → Auto number calling (interval-based)
↓
Claims auto-verified → Announce to all
↓
Full House → Game ends → Show Leaderboard

```

#### 4. Host Controls During Game

- ❌ No manual pause (auto-call only)
- ❌ No player removal mid-game (MVP)
- ✅ View player count
- ✅ See claim announcements
- ✅ Game auto-ends on Full House

---

### 🎮 PLAYER Perspective - Complete Journey

#### 1. Joining

| Method | Flow |
|--------|------|
| **Via Link** | Click → Auto-join lobby |
| **Via Code** | Home page → Enter code → Join |

#### 2. Lobby/Waiting

- See game title
- See "Waiting for admin to start..."
- 1 ticket automatically assigned (no customization for MVP)

#### 3. Gameplay Screen

```

┌─────────────────────────────────────────┐
│ [Called Number: 42] 🎲 Animation │
│ │
│ History: 38, 21, 55, 12, 7... (10 max) │
├─────────────────────────────────────────┤
│ │
│ [ PLAYER TICKET ] │
│ (Tap numbers to mark) │
│ │
├─────────────────────────────────────────┤
│ [CLAIM] button [😀🎉👏] Reactions │
└─────────────────────────────────────────┘

```

#### 4. Key Player Features

| Feature | Behavior |
|---------|----------|
| **Number Display** | Shows at top with animation + sound |
| **History** | Only last 10 numbers visible |
| **Marking** | Manual tap to mark (no auto-highlight) |
| **Claim Button** | Shows all patterns → Select to claim |
| **Claim Verification** | Auto-verified against called numbers |
| **Reactions** | Emoji floats across all screens |
| **Pattern Status** | See which patterns already claimed |
| **Real-time Score** | ❌ Not shown during game |
| **End Screen** | See final score + leaderboard |

#### 5. Claim Flow

```

Player clicks [CLAIM]
↓
Modal shows all patterns selected by admin
↓
Player taps pattern (e.g., "First Row")
↓
System verifies ticket against called numbers
↓
✅ Valid → Award points, announce to all
❌ Invalid → "Invalid claim" message

```

#### 6. Disconnection Handling

- ❓ (To be decided: Can rejoin? Ticket preserved?)

---

## 📋 Session Summary - All Ideas Generated

### ✅ Confirmed MVP Features

| # | Feature | Details |
|---|---------|---------|
| 1 | Game Creation | Host creates with title + settings |
| 2 | Pattern Selection | 6 default, can customize |
| 3 | Pattern Variants | Tiered points for multiple claimers |
| 4 | Points Configuration | Custom points per pattern |
| 5 | Number Interval | 7s / 10s / 15s options |
| 6 | Min/Max Players | Host configurable (2-75) |
| 7 | Invite System | Code + shareable link |
| 8 | 1 Ticket per Player | No customization for MVP |
| 9 | Auto Number Calling | Based on interval setting |
| 10 | Animated Number Reveal | Visual + sound (mutable) |
| 11 | Manual Marking | Tap to mark numbers |
| 12 | Limited History | Last 10 numbers only |
| 13 | Claim System | Button → Pattern list → Auto-verify |
| 14 | Floating Reactions | Emojis visible to all |
| 15 | Pattern Status | See claimed patterns |
| 16 | Auto End | Full House ends game |
| 17 | Leaderboard | Final standings by points |
| 18 | Game History | Players see past games |
| 19 | BetterAuth | Email/password only |

### 🏗️ Technical Architecture Confirmed

| Component | Technology |
|-----------|------------|
| Frontend | Next.js (App Router) |
| Hosting | Vercel |
| Database | NeonDB (Postgres) |
| Real-time | Pusher Channels |
| Caching/Locks | Upstash Redis |
| Auth | BetterAuth |

### 📝 Open Questions for Later

1. Disconnection handling - can players rejoin?
2. Exact prize patterns list beyond basic 6
3. UI/UX details (screenshots to be provided)

---

## 🎉 Brainstorming Session Complete!

**Techniques Used:**
1. ✅ Constraint Mapping - Technical stack finalized
2. ✅ SCAMPER - Feature decisions made
3. ✅ Role Playing - User journeys mapped

**Next Steps:**
→ Proceed to Product Brief creation
→ Use these insights to build PRD
```
