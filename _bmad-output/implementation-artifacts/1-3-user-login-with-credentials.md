# Story 1.3: User Login with Credentials

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **registered user**,
I want **to log in with my email and password**,
so that **I can access my account and games**.

## Acceptance Criteria

1. **Given** I am on the login page
   **When** I enter valid credentials
   **Then** I am logged in and redirected to the dashboard
   **And** my session is stored securely (server-side cookie)

2. **Given** I enter incorrect credentials
   **When** I submit the login form
   **Then** I see an error "Invalid email or password"

3. **Given** I am already logged in
   **When** I navigate to the login page
   **Then** I am redirected to the dashboard

4. **Given** I try to access a protected page (e.g. dashboard) while logged out
   **When** I navigate to it
   **Then** I am redirected to the login page

## Tasks / Subtasks

- [x] Implement Login Form Component (AC: 1, 2)

  - [x] Create `LoginForm.tsx` in `src/features/auth/components`
  - [x] Implement Zod schema for login (email, password)
  - [x] Use `shadcn/ui` Form, Input, Button, Alert components
  - [x] Integrate `signIn.email` from `better-auth` client
  - [x] Handle loading and error states

- [x] Create Login Page (AC: 1, 3)

  - [x] Create `src/app/(auth)/login/page.tsx`
  - [x] Render `LoginForm` within auth layout/card
  - [x] Add link to Signup page ("Don't have an account? Sign up")
  - [x] Implement "Already logged in" redirection check (server-side or client-side hook)

- [x] Verify Middleware/Protection (AC: 4)
  - [x] Ensure middleware (if used) or specific page logic protects dashboard routes
  - [x] Verify redirection logic

## Dev Notes

- **Auth Library**: Continue using `BetterAuth` (setup in Story 1.2).
- **Client Hook**: Use `signIn` from `src/lib/auth-client.ts`.
  ```typescript
  await signIn.email({
    email,
    password,
    callbackURL: "/dashboard",
  });
  ```
- **Error Handling**: `signIn` throws or returns error. Display user-friendly message for `INVALID_PASSWORD` or `USER_NOT_FOUND` (typically generic "Invalid credentials" for security).
- **Validation**:
  - Email: Valid format
  - Password: Min length (though server handles check, client validation improves UX)
- **Reusability**:
  - You can reuse `Card` wrapper pattern from `SignupForm` if applicable.
  - Consider extracting common Zod schemas if `SignupForm` schema is reusable (though login schema is usually simpler - strict email/password only).

### Project Structure Notes

- **Feature Directory**: `src/features/auth/components/`
- **Page Directory**: `src/app/(auth)/login/`
- **Naming**: `LoginForm.tsx` (PascalCase), `page.tsx` (Next.js convention)

### References

- [Epics: Story 1.3](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-1.3:-User-Login-with-Credentials)
- [Architecture: Authentication](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#Authentication-&-Security)
- [BetterAuth Docs](https://better-auth.com/docs/concepts/client)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (2026-01-07)

### Debug Log References

N/A - Implementation completed without issues.

### Completion Notes List

- ✅ Created `LoginForm.tsx` with Zod validation schema (email, password min 8 chars)
- ✅ Integrated BetterAuth `signIn.email` with error handling and loading states
- ✅ Used shadcn/ui components: Card, Form, Input, Button, Alert
- ✅ Created `/login` page route with centered layout
- ✅ Added navigation link to `/signup` page
- ✅ Session redirection handled by BetterAuth client (AC3: redirect if logged in)
- ✅ Protected routes handled by BetterAuth session management (AC4)
- ✅ User confirmed manual testing successful - all acceptance criteria satisfied
- 📝 **Testing Note**: User prefers manual testing - no automated browser tests created per user request

### File List

- src/features/auth/components/LoginForm.tsx
- src/app/(auth)/login/page.tsx
