---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - "_bmad-output/analysis/brainstorming-session-2026-01-05.md"
date: 2026-01-05
author: femil
---

# Product Brief: Tambola

## Executive Summary

**Tambola** is an online multiplayer Tambola (Housie) game that transforms the traditional party favorite into a seamless digital experience. The platform enables hosts to go from idea to live game in under 5 minutes — no tickets to print, no numbers to track, no claims to verify manually.

Built for remote teams and distributed families, Tambola brings the joy of this beloved game to the digital age with real-time synchronization, automatic number calling, instant claim verification, and rich customization options that let every host create their perfect game.

---

## Core Vision

### Problem Statement

Playing Tambola remotely today is either **impractical or clunky**:

- **Physical games** require extensive preparation: printing tickets, distributing them, manual number calling, and hand-verifying claims
- **Remote alternatives** are makeshift — video calls with screen sharing, no individual tickets, and manual tracking that breaks the flow

For HR teams organizing virtual team-building or families spread across cities, there's no simple way to run a proper Tambola game online.

### Problem Impact

- **Spontaneity is killed**: You can't just decide to play — you need hours of prep
- **Remote participation is broken**: Distributed teams and families lose access to a beloved shared activity
- **The host experience is painful**: Organizers become ticket-printers and claim-verifiers instead of participants

### Why Existing Solutions Fall Short

Current approaches rely on:

- **Video calls + screen share**: Everyone sees the same screen, but no one has their own ticket. The personal, tactile experience is lost.
- **Manual coordination**: Hosts juggle spreadsheets, messages, and video — exhausting for what should be fun
- **Generic tools**: No customization for prize patterns, points, or game pace

### Proposed Solution

A purpose-built online Tambola platform where:

1. **Hosts create games in minutes** — configure patterns, points, player limits, and calling speed
2. **Players join via link/code** — receive their own digital tickets instantly
3. **Numbers auto-call with animations** — everyone sees the same number in real-time
4. **Claims are auto-verified** — no disputes, no manual checking
5. **Real-time reactions** — floating emojis keep the social energy alive

### Key Differentiators

| Differentiator                  | Why It Matters                                                        |
| ------------------------------- | --------------------------------------------------------------------- |
| **"Idea to game in 5 minutes"** | Eliminates all physical prep work — spontaneous games become possible |
| **Custom configurations**       | Hosts own the experience — patterns, points, speed all adjustable     |
| **Real-time multiplayer**       | Pusher-powered sync means everyone shares the moment together         |
| **Auto-verification**           | Claims are instantly validated — no arguments, no errors              |
| **Free-tier architecture**      | NeonDB + Pusher + Upstash = production-ready at zero cost             |

---

## Target Users

### Primary Users

#### 🎭 Host Persona: "The Event Organizer"

**Who They Are:**

- **Corporate**: HR managers, team leads, or office admins organizing virtual team events
- **Family**: The family elder or the "organizer sibling/cousin" who rallies everyone during festivals

**Motivation:**

- Create moments of joy and connection in remote/distributed settings
- Deliver a smooth, professional experience without technical headaches
- Make gatherings memorable with an activity everyone can participate in

**Current Pain:**

- Prep work is exhausting (tickets, tracking, verifying)
- Remote alternatives feel amateur and clunky
- Tech-resistant members struggle to participate

**Success Looks Like:**

- Setup takes under 5 minutes
- Everyone joins without issues
- The game runs smoothly with zero manual intervention
- "That was so much fun, let's do it again!"

---

#### 🎮 Player Persona: "The Participant"

**Who They Are:**

- **Corporate**: Employees ranging from interns to senior executives
- **Family**: Children, parents, grandparents — all age groups and tech levels

**Device Context:**

- Primarily mobile (phones/tablets)
- Some on laptops/desktops during work events

**Motivation:**

- Have fun and feel included
- Easy to understand, easy to play
- No learning curve — just join and play

**Current Pain:**

- Video call Tambola is confusing without individual tickets
- Missing numbers, can't keep up
- Don't understand claiming rules

**Success Looks Like:**

- Join in 30 seconds via shared link
- See their own ticket clearly
- Tap to mark, tap to claim — intuitive
- Win something and celebrate with reactions!

---

### Secondary Users

#### 📖 First-Time User (Needs Onboarding)

**Context:** Tech-resistant players or those unfamiliar with Tambola

**Needs:**

- Comprehensive **"How to Play"** documentation
- Step-by-step guidance for both hosts and players
- Rich, well-formatted docs (differentiator vs competitors' sparse FAQs)
- Visual guides, pattern explanations, and claim rules

---

### User Journey

| Phase          | Host Experience                                      | Player Experience                                 |
| -------------- | ---------------------------------------------------- | ------------------------------------------------- |
| **Discovery**  | Finds via search, word-of-mouth, or shared game link | Receives invite link/code from host               |
| **Onboarding** | Creates account → First game setup wizard            | Joins via link → Sees "How to Play" if needed     |
| **Core Usage** | Configure game → Share link → Watch it run           | Join lobby → Play when game starts                |
| **Aha Moment** | "It's live and running in 3 minutes!"                | "I have my own ticket and can claim instantly!"   |
| **Long-term**  | Returns for next event, shares with other organizers | Joins whenever invited, associates brand with fun |
