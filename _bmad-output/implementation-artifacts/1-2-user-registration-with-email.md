---
story_key: "1-2-user-registration-with-email"
epic_id: "1"
status: "done"
date: "2026-01-06"
---

# Story 1.2: User Registration with Email

## Story Foundation

### User Story

**As a** new user,
**I want** to create an account with my email and password,
**So that** I can host and join Tambola games.

### Acceptance Criteria

- [x] **Database Schema Updated**: `User`, `Session`, `Account`, and `VerificationToken` tables created via Prisma migration to support BetterAuth.
- [x] **Backend Auth Configured**: BetterAuth initialized with Email/Password plugin in `src/lib/auth.ts` and API route created at `src/app/api/auth/[...all]/route.ts`.
- [x] **Signup Form Component**: `SignupForm.tsx` created using shadcn/ui components (Form, Input, Button) + Zod validation.
- [x] **Signup Page Created**: `src/app/(auth)/signup/page.tsx` is accessible and renders the form.
- [x] **Validation Implemented**: Form enforces:
  - Valid email format.
  - Password min 8 chars.
  - Password confirmation match (optional but recommended).
- [x] **Error Handling**: Displays user-friendly error if email already exists or server fails.
- [x] **Success Flow**: On successful signup, user is:
  - Automatically logged in.
  - Redirected to `/dashboard` (or `/` if dashboard not ready, but Story 1.3 implies dashboard).
- [x] **Security**: Password is hashed (bundled with BetterAuth), and sessions are secure (HttpOnly cookies).

### Context & Business Value

User registration is the entry point for Game Hosts. While players _can_ join anonymously (future requirement), Hosts MUST have an account to create and manage games. This story establishes the core identity layer using BetterAuth, which will be reused for Login (1.3) and Password Reset (1.5).

---

## Developer Context

### Technical Stack & Versions

- **Auth Library**: BetterAuth (Latest) - _Email/Password Plugin ONLY for MVP_.
- **Database**: NeonDB + Prisma ORM.
- **Validation**: Zod (via `react-hook-form` + `@hookform/resolvers`).
- **UI Components**: shadcn/ui (Form, Input, Button, Card, Label, Alert).
- **Client State**: `better-auth/client` for frontend hooks.

### Architecture Compliance

1.  **Feature Isolation**: All auth UI components go in `src/features/auth/components`.
2.  **API Routes**: Use `src/app/api/auth/[...all]/route.ts` as the single entry point for BetterAuth.
3.  **Client-Side**: Use `"use client"` for the Signup Form.
4.  **Error Handling**: Return `{ error: ... }` format is standard, but check BetterAuth's native response format compatibility (BetterAuth client handles this mostly).
5.  **Naming**:
    - `SignupForm.tsx` (PascalCase)
    - `auth.ts` (kebab-case)
    - `schema.prisma` (camelCase fields: `createdAt`, `updatedAt`).

### Prerequisite: Previous Story Analysis (1.1)

- **Available**: `src/lib/auth.ts` exists but is a placeholder. You must fill it with actual BetterAuth config.
- **Available**: `src/lib/prisma.ts` exists.
- **Available**: `shadcn/ui` components are initialized.

---

## Implementation Guide

### Step 1: Update Prisma Schema

Update `prisma/schema.prisma` to include the standard BetterAuth models (User, Session, Account, Verification).

**Reference Schema (BetterAuth Standard):**

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean
  image         String?
  createdAt     DateTime
  updatedAt     DateTime
  sessions      Session[]
  accounts      Account[]

  @@map("user")
}

model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime
  updatedAt DateTime

  @@map("session")
}

model Account {
  id           String    @id @default(cuid())
  accountId    String
  providerId   String
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken  String?
  refreshToken String?
  idToken      String?
  expiresAt    DateTime?
  password     String?
  createdAt    DateTime
  updatedAt    DateTime

  @@map("account")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime?
  updatedAt  DateTime?

  @@map("verification")
}
```

_Run `npx prisma migrate dev --name init_auth` to apply._

### Step 2: Configure BetterAuth Backend

Modify `src/lib/auth.ts` to implement the Email/Password credential provider.

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  // Add other plugins if needed, but keep it minimal for now
});
```

### Step 3: Create Auth API Route

Create `src/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth"; // Adjust import path
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Step 4: Create BetterAuth Client

Create `src/lib/auth-client.ts` for frontend hooks.

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL, // e.g. http://localhost:3000
});

export const { useSession, signUp, signIn, signOut } = authClient;
```

### Step 5: Implement Signup Form

Create `src/features/auth/components/SignupForm.tsx`.

- Use `react-hook-form` + Zod.
- Use `shadcn/ui` components (`Form`, `FormControl`, `FormField`, `Input`, `Button`).
- Call `signUp.email(...)` from `auth-client`.

**Validation Schema:**

```typescript
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});
```

**Logic:**

```typescript
const onSubmit = async (values: z.infer<typeof signupSchema>) => {
  await signUp.email(
    {
      email: values.email,
      password: values.password,
      name: values.name,
      callbackURL: "/dashboard", // Redirect usage
    },
    {
      onError: (ctx) => {
        // specific error handling
        toast.error(ctx.error.message);
      },
    }
  );
};
```

### Step 6: Create Signup Page

Create `src/app/(auth)/signup/page.tsx`:

- Render `SignupForm` inside a centered Card/Layout.
- Add link to Login page ("Already have an account? Login").

---

## Testing Requirements

### Manual Verification

1.  **Positive Case**: Enter valid Name, Email, Password -> Click Sign Up -> Check DB for new User record -> Verify redirect to Dashboard (or 404/placeholder if dashboard missing).
2.  **Negative Case**: Enter existing email -> Expect error "Email already exists" (or similar from BetterAuth).
3.  **Validation**: Try password < 8 chars -> Expect UI error.

### Automated Tests (Optional/Future)

- Unit test `SignupForm` validation using React Testing Library.

---

## Dev Agent Record

### Implementation Notes

- Installed added dependencies: `zod`, `react-hook-form`, `@hookform/resolvers`, and shadcn components (`form`, `input`, `button`, `card`, `label`, `alert`).
- Configured BetterAuth backend in `src/lib/auth.ts` and created `src/app/api/auth/[...all]/route.ts`.
- Created BetterAuth client in `src/lib/auth-client.ts`.
- Implemented `SignupForm` component using shadcn/ui and Zod validation as specified.
- Created `/signup` page.
- **Resolution of Drift/Migrate issues**:
  - Encountered "Invalid db[model].create()" errors during dev server startup.
  - Updated `session` model in `prisma/schema.prisma` to include `token`, `unique([token])`, and `index([userId])` based on BetterAuth requirements.
  - Updated `Account` model to include `token` related fields.
  - Updated `Verification` model to include index on identifier.
  - Changed generator output to `../src/generated/prisma`.
  - Created `prisma.config.ts`.
  - Created clean `src/lib/prisma.ts`.
  - Removed `node_modules` and re-installed.
  - Successfully verified signup flow manually (redirects to dashboard 404 as expected).

### File List

- src/lib/auth.ts
- src/app/api/auth/[...all]/route.ts
- src/lib/auth-client.ts
- src/features/auth/components/SignupForm.tsx
- src/app/(auth)/signup/page.tsx
- src/app/page.tsx
- prisma/schema.prisma
- prisma/migrations/20260107090031_init_auth/migration.sql
- src/lib/prisma.ts
- prisma.config.ts
- .gitignore
- package.json
- pnpm-lock.yaml
- src/components/ui/alert.tsx
- src/components/ui/button.tsx
- src/components/ui/card.tsx
- src/components/ui/form.tsx
- src/components/ui/input.tsx
- src/components/ui/label.tsx

### Checklist for Dev Agent

- [x] Did you generate the `auth-client.ts` file?
- [x] Is the Prisma schema applied with `migrate dev`?
- [x] Are environment variables set (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)?

### Senior Developer Review (AI)

_Reviewer: AI Senior Dev on 2026-01-07_

**Findings:**

1.  **Documentation Gap**: The original Dev Record missed significant file changes (deps, migrations, UI components). Fixed.
2.  **Missing Recommended AC**: Password confirmation was missing. Fixed.
3.  **Schema Naming**: "Verification" vs "VerificationToken" - verified as non-critical BetterAuth adapter standard.
4.  **Error Handling**: Direct error message display is acceptable for MVP but should be monitored.

**Outcome**: **APPROVED** (after auto-fixes)

### Change Log

| Date       | Author      | Change Description                                                       |
| :--------- | :---------- | :----------------------------------------------------------------------- |
| 2026-01-07 | Dev Agent   | Initial implementation of Story 1.2 (Auth Backend + Signup UI).          |
| 2026-01-07 | AI Reviewer | Fixed missing password confirmation field. Updated Dev Record file list. |
