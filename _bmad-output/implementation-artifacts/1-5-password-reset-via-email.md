# Story 1.5: Password Reset via Email

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user who forgot my password**,
I want **to reset my password via email**,
so that **I can regain access to my account**.

## Acceptance Criteria

1. **Given** I am on the forgot password page
   **When** I enter my registered email
   **Then** a password reset link is sent to my email
   **And** I see a message "Check your email for reset instructions"

2. **Given** I click a valid reset link
   **When** I enter a new password
   **Then** my password is updated
   **And** I am redirected to login with a success message

3. **Given** the reset link has expired (24 hours)
   **When** I click it
   **Then** I see an error "Reset link has expired"

## Tasks / Subtasks

- [x] Configure BetterAuth Password Reset Email (AC: 1)

  - [x] Add `sendResetPassword` function to `src/lib/auth.ts` configuration
  - [x] Integrate email service (Resend recommended) for sending reset emails
  - [x] Create email template for password reset link
  - [x] Test email delivery in development mode

- [x] Create Forgot Password Page (AC: 1)

  - [x] Create `/src/app/(auth)/forgot-password/page.tsx`
  - [x] Build form with email input and Zod validation
  - [x] Implement `forgetPassword` from BetterAuth client
  - [x] Show success message after email sent
  - [x] Handle errors (email not found, network errors)

- [x] Create Reset Password Page (AC: 2, 3)

  - [x] Create `/src/app/(auth)/reset-password/page.tsx`
  - [x] Extract token from URL query parameters
  - [x] Build form with new password input (min 8 chars)
  - [x] Implement `resetPassword` from BetterAuth client
  - [x] Validate token on page load
  - [x] Show error for expired/invalid tokens
  - [x] Redirect to login with success message after reset

- [x] Add Navigation Links (AC: 1)
  - [x] Add "Forgot Password?" link to login page
  - [x] Add "Back to Login" link to forgot password page

## Dev Notes

### BetterAuth Password Reset Implementation

**Core Mechanism:**
BetterAuth provides built-in password reset functionality that requires:

1. Server-side configuration with `sendResetPassword` callback
2. Email service integration to send reset links
3. Client-side pages for requesting and completing password reset

**Server Configuration (src/lib/auth.ts):**

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // Send password reset email
      await resend.emails.send({
        from: "Tambola <noreply@yourdomain.com>",
        to: user.email,
        subject: "Reset Your Password",
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${url}">Reset Password</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });
    },
  },
});
```

**Client-Side Methods:**

```typescript
// From @/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

// Available methods:
export const { forgetPassword, resetPassword } = authClient;
```

### Email Service Integration

**Recommended: Resend**

- Free tier: 100 emails/day, 3,000/month
- Simple API, excellent Next.js integration
- Installation: `npm install resend`
- Requires `RESEND_API_KEY` in `.env.local`

**Alternative: Nodemailer**

- More complex setup, requires SMTP configuration
- Use if custom email server is required

**Environment Variables Required:**

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Implementation Flow

**1. Forgot Password Flow (AC: 1):**

```typescript
// /src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { forgetPassword } from "@/lib/auth-client";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    await forgetPassword(
      { email },
      {
        onSuccess: () => {
          setSuccess(true);
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Failed to send reset email");
        },
      }
    );

    setIsLoading(false);
  };

  if (success) {
    return (
      <div>
        <h1>Check Your Email</h1>
        <p>We've sent password reset instructions to {email}</p>
        <Link href="/login">Back to Login</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Email input, submit button, error display */}
    </form>
  );
}
```

**2. Reset Password Flow (AC: 2, 3):**

```typescript
// /src/app/(auth)/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/auth-client";
import { z } from "zod";

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setError("");

    const result = passwordSchema.safeParse({ password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    await resetPassword(
      { newPassword: password, token },
      {
        onSuccess: () => {
          router.push("/login?reset=success");
        },
        onError: (ctx) => {
          const message = ctx.error.message;
          if (message.includes("expired")) {
            setError("Reset link has expired");
          } else {
            setError(message || "Failed to reset password");
          }
        },
      }
    );

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Password input, submit button, error display */}
    </form>
  );
}
```

### Token Expiration

**BetterAuth Default:**

- Reset tokens expire after **24 hours** (configurable)
- Tokens are single-use (invalidated after successful reset)
- Expired tokens return error: "Reset link has expired"

**Configuration (if custom expiration needed):**

```typescript
// In src/lib/auth.ts
emailAndPassword: {
  enabled: true,
  resetPasswordTokenExpiresIn: 60 * 60 * 24, // 24 hours in seconds
  sendResetPassword: async ({ user, url }) => { /* ... */ }
}
```

### UI/UX Considerations

**Forgot Password Page:**

- Simple email input form
- Clear instructions: "Enter your email to receive reset instructions"
- Success state shows confirmation message
- Link back to login page

**Reset Password Page:**

- Password input with visibility toggle
- Password requirements displayed (min 8 chars)
- Clear error messages for expired/invalid tokens
- Success message before redirect to login

**Login Page Enhancement:**

- Add "Forgot Password?" link below password input
- Style consistently with existing auth pages

### Security Considerations

**Server-Authoritative:**

- All password reset logic handled by BetterAuth server-side
- Tokens generated and validated server-side
- No client-side token manipulation possible

**Email Security:**

- Reset links contain cryptographically secure tokens
- Tokens are single-use and time-limited
- Email should clearly state it's from Tambola

**Rate Limiting:**

- BetterAuth includes built-in rate limiting for password reset requests
- Prevents abuse/spam of reset email functionality

### Error Handling

**Common Errors:**

1. **Email not found**: Show generic message "If email exists, reset link sent" (security best practice)
2. **Invalid token**: "Reset link is invalid"
3. **Expired token**: "Reset link has expired"
4. **Network error**: "Failed to send reset email. Please try again."
5. **Weak password**: "Password must be at least 8 characters"

**Pattern from Previous Stories:**

```typescript
const [error, setError] = useState("");

// Display error
{
  error && (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
```

### Project Structure Notes

**New Files:**

- `/src/app/(auth)/forgot-password/page.tsx` - Request reset page
- `/src/app/(auth)/reset-password/page.tsx` - Complete reset page

**Modified Files:**

- `/src/lib/auth.ts` - Add `sendResetPassword` configuration
- `/src/app/(auth)/login/page.tsx` - Add "Forgot Password?" link
- `.env.local` - Add `RESEND_API_KEY`
- `package.json` - Add `resend` dependency

**Naming Conventions:**

- Route: `/forgot-password` (kebab-case)
- Route: `/reset-password` (kebab-case)
- Components: `ForgotPasswordPage`, `ResetPasswordPage` (PascalCase)

### Previous Story Intelligence

**From Story 1.2 (User Registration):**

- BetterAuth client configured in `src/lib/auth-client.ts`
- Pattern: Use Zod schemas for form validation
- Pattern: `useState` for loading/error states
- Pattern: shadcn/ui components (Input, Button, Alert)

**From Story 1.3 (User Login):**

- Pattern: `onSuccess` callback for redirects
- Pattern: `onError` callback for error handling
- Pattern: Use `useRouter` from `next/navigation`
- Pattern: Show success messages via URL params

**From Story 1.4 (User Logout):**

- Pattern: BetterAuth methods exported from `auth-client.ts`
- Pattern: Loading states during async operations
- Pattern: Graceful error handling with user-friendly messages

**Established Code Patterns:**

```typescript
// 1. Form validation with Zod
const schema = z.object({ field: z.string().min(8) });
const result = schema.safeParse(data);

// 2. Loading state management
const [isLoading, setIsLoading] = useState(false);
setIsLoading(true);
await authClient.method();
setIsLoading(false);

// 3. Error display
{
  error && (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

// 4. Success redirect
router.push("/path?status=success");
```

### Architecture Compliance

**From Architecture Document:**

- **Auth Provider**: BetterAuth with email/password
- **Email Service**: Resend (recommended for free tier)
- **Sessions**: Server-side, secure cookies (BetterAuth handles)
- **Component Pattern**: `"use client"` for interactive forms
- **Naming**: kebab-case for routes, PascalCase for components
- **Error Handling**: User-friendly messages, no technical details exposed
- **Routing**: Next.js App Router with `(auth)` route group

**Security Requirements:**

- Server-authoritative password reset (BetterAuth enforces)
- Secure token generation and validation (BetterAuth handles)
- Time-limited reset links (24 hours default)
- Single-use tokens (BetterAuth enforces)

### Latest Technical Information

**BetterAuth v1.x (Current - 2026):**

- `forgetPassword({ email })` - Request password reset
- `resetPassword({ newPassword, token })` - Complete password reset
- Built-in token expiration (24 hours default)
- Automatic rate limiting for security
- Supports custom email templates

**Resend API (2026):**

- Free tier: 100 emails/day, 3,000/month
- Simple API: `resend.emails.send({ from, to, subject, html })`
- Excellent deliverability
- No credit card required for free tier

**Next.js 16+ App Router:**

- Use `useSearchParams()` to read URL query params
- Use `useRouter()` from `next/navigation` for redirects
- Route groups like `(auth)` for shared layouts

### Testing Approach

**Manual Testing:**

1. Navigate to `/forgot-password`
2. Enter registered email, submit
3. Check email inbox for reset link
4. Click reset link (should open `/reset-password?token=xxx`)
5. Enter new password, submit
6. Verify redirect to login with success message
7. Log in with new password

**Edge Cases to Test:**

1. Email not in database (should show generic success message)
2. Invalid token in URL (should show error)
3. Expired token (wait 24+ hours or manually test)
4. Weak password (less than 8 chars)
5. Network error during email send

**Development Email Testing:**

- Use Resend test mode or console logging
- Alternatively, use MailHog or similar for local email testing

### References

- [Epics: Story 1.5](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-1.5:-Password-Reset-via-Email)
- [Architecture: Authentication](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#Authentication-&-Security)
- [BetterAuth Server Config](file:///Users/mac/Desktop/femil/tambola/src/lib/auth.ts)
- [BetterAuth Client](file:///Users/mac/Desktop/femil/tambola/src/lib/auth-client.ts)
- [Previous Story: Logout](file:///Users/mac/Desktop/femil/tambola/_bmad-output/implementation-artifacts/1-4-user-logout.md)
- [BetterAuth Password Reset Docs](https://better-auth.com)
- [Resend Documentation](https://resend.com/docs)

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash Thinking Experimental (2026-01-07)

### Debug Log References

No critical errors encountered during implementation.

### Completion Notes List

- ✅ Installed Resend package (v6.6.0) for email delivery
- ✅ Configured BetterAuth with `sendResetPassword` callback in `src/lib/auth.ts`
- ✅ Created HTML email template for password reset links
- ✅ Implemented forgot password page at `/forgot-password` with:
  - Email input form with Zod validation
  - Using `authClient.requestPasswordReset()` method
  - Success state showing confirmation message
  - Error handling for network failures
  - "Back to Login" navigation link
- ✅ Implemented reset password page at `/reset-password` with:
  - Token extraction from URL query parameters
  - Password + Confirmation input with match validation
  - Suspense boundary for useSearchParams (Next.js App Router requirement)
  - Using `authClient.resetPassword()` method
  - Error handling for expired/invalid tokens
  - Redirect to login with success message
  - Accessibility: aria-describedby for password requirements
- ✅ Added "Forgot Password?" link to LoginForm component (using Next.js Link)
- ✅ Added error logging to sendResetPassword for debugging
- ✅ All acceptance criteria satisfied:
  - AC1: User can request password reset via email ✓
  - AC2: User can reset password with valid token ✓
  - AC3: Expired tokens show appropriate error message ✓

**Technical Decisions:**

- Used `authClient.requestPasswordReset()` and `authClient.resetPassword()` from BetterAuth client
- Implemented client-side validation using Zod schemas before making API calls
- Used React hooks (useState, useId, useSearchParams, useRouter) for state management and navigation
- Followed established patterns from previous auth stories (LoginForm, SignupForm)
- Added password confirmation field for security/UX best practice

**Environment Variables Required:**

- `RESEND_API_KEY` - Resend API key for email delivery
- `RESEND_FROM_EMAIL` - Sender email address (e.g., noreply@yourdomain.com)

### File List

**New Files:**

- `src/app/(auth)/forgot-password/page.tsx` - Forgot password page component
- `src/app/(auth)/reset-password/page.tsx` - Reset password page component

**Modified Files:**

- `src/lib/auth.ts` - Added Resend integration and sendResetPassword callback
- `src/lib/auth-client.ts` - Added default export for authClient (though not used in final implementation)
- `src/features/auth/components/LoginForm.tsx` - Added "Forgot Password?" link
- `package.json` - Added resend dependency
- `pnpm-lock.yaml` - Updated with resend package lock
