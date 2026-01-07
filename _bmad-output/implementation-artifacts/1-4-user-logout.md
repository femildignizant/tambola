# Story 1.4: User Logout

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **logged-in user**,
I want **to log out of my account**,
so that **I can secure my session on shared devices**.

## Acceptance Criteria

1. **Given** I am logged in
   **When** I click the logout button
   **Then** my session is destroyed
   **And** I am redirected to the landing page
   **And** I cannot access protected routes without logging in again

## Tasks / Subtasks

- [x] Create Logout Button Component (AC: 1)

  - [x] Add logout button to the main layout or navigation
  - [x] Implement `signOut` from BetterAuth client
  - [x] Handle loading state during logout
  - [x] Redirect to landing page (`/`) after successful logout

- [x] Verify Session Destruction (AC: 1)
  - [x] Ensure session cookie is cleared
  - [x] Verify protected routes redirect to login after logout
  - [x] Test that re-accessing dashboard requires login

## Dev Notes

### Authentication Implementation

- **Auth Library**: Continue using `BetterAuth` (setup in Story 1.2)
- **Client Hook**: Use `signOut` from `src/lib/auth-client.ts`

  ```typescript
  import { signOut } from "@/lib/auth-client";

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };
  ```

### Implementation Approach

**Option 1: Add Logout Button to Root Layout (Recommended)**

- Add a simple logout button to `src/app/layout.tsx` that appears when user is logged in
- Use `useSession` hook to check authentication state
- This makes logout available on all pages

**Option 2: Create a Shared Navigation Component**

- Create `src/components/Navigation.tsx` or `src/components/Header.tsx`
- Include logout button in navigation
- Import in root layout

**Recommended Approach**: Option 1 for simplicity in MVP. The logout button should be conditionally rendered based on session state.

### BetterAuth signOut API

```typescript
// From @/lib/auth-client.ts
export const { signOut } = authClient;

// Usage in component
await signOut({
  fetchOptions: {
    onSuccess: () => {
      // Redirect to landing page
      router.push("/");
    },
    onError: (error) => {
      // Handle error (optional)
      console.error("Logout failed:", error);
    },
  },
});
```

### Session Management

- **Session Storage**: BetterAuth uses server-side sessions with secure HTTP-only cookies
- **Session Destruction**: `signOut()` automatically:
  - Clears the session cookie
  - Invalidates the session on the server
  - Triggers re-render of components using `useSession`

### Protected Routes

- **Current Implementation**: Based on Story 1.3, protected routes (like `/dashboard`) should already redirect to `/login` if user is not authenticated
- **Verification**: After logout, attempting to access `/dashboard` should redirect to `/login`
- **No Additional Work Needed**: BetterAuth middleware/session checks handle this automatically

### UI/UX Considerations

- **Button Placement**: Top-right corner is standard for logout buttons
- **Loading State**: Show loading indicator while logout is in progress
- **Confirmation**: For MVP, no confirmation dialog needed (can add later if desired)
- **Visual Feedback**: Button should be clearly labeled "Logout" or "Sign Out"

### Error Handling

- **Network Errors**: If logout API call fails, show error message but still clear client-side state
- **Graceful Degradation**: Even if server-side logout fails, ensure client redirects to landing page

### Testing Approach

1. **Manual Testing**:

   - Log in as a user
   - Click logout button
   - Verify redirect to landing page (`/`)
   - Attempt to access `/dashboard` - should redirect to `/login`
   - Log in again to verify session was properly destroyed

2. **Browser DevTools**:
   - Check Application > Cookies - session cookie should be cleared
   - Check Network tab - logout API call should return 200

### Project Structure Notes

- **Component Location**:
  - If creating separate component: `src/components/LogoutButton.tsx` or `src/features/auth/components/LogoutButton.tsx`
  - If adding to layout: `src/app/layout.tsx`
- **Naming**: `LogoutButton.tsx` (PascalCase)
- **Client Component**: Must use `"use client"` directive (requires hooks and interactivity)

### Previous Story Intelligence

**From Story 1.2 (User Registration)**:

- BetterAuth client is configured in `src/lib/auth-client.ts`
- Exports: `useSession`, `signUp`, `signIn`, `signOut`
- Pattern: Use `callbackURL` for redirects
- Error handling: Use `onError` and `onSuccess` callbacks

**From Story 1.3 (User Login)**:

- Login form uses `signIn.email` with `callbackURL: "/dashboard"`
- Loading states managed with `useState`
- Errors displayed using `Alert` component from shadcn/ui
- Router from `next/navigation` used for programmatic navigation

**Key Pattern Established**:

```typescript
const [isLoading, setIsLoading] = useState(false);
const router = useRouter();

const handleAction = async () => {
  setIsLoading(true);
  await authClient.action(
    {
      // params
    },
    {
      onSuccess: () => router.push("/path"),
      onError: (ctx) => setError(ctx.error.message),
    }
  );
  setIsLoading(false);
};
```

### Architecture Compliance

**From Architecture Document**:

- **Auth Provider**: BetterAuth (email/password)
- **Sessions**: Server-side, secure cookies
- **Component Pattern**: Use `"use client"` for interactive components
- **Naming**: PascalCase for components, camelCase for functions
- **Error Handling**: Use shadcn/ui Alert component for user-facing errors
- **Routing**: Use Next.js App Router (`next/navigation`)

**Security Requirements**:

- Server-side session management (BetterAuth handles this)
- Secure HTTP-only cookies (BetterAuth handles this)
- No client-side token storage needed

### Latest Technical Information

**BetterAuth v1.x (Current)**:

- `signOut()` method available from auth client
- Supports `fetchOptions` for callbacks (`onSuccess`, `onError`)
- Automatically handles session cleanup
- Works seamlessly with Next.js App Router

**Next.js 16+ App Router**:

- Use `useRouter` from `next/navigation` (not `next/router`)
- Client components require `"use client"` directive
- Server components can check session via BetterAuth server utilities

### References

- [Epics: Story 1.4](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/epics.md#Story-1.4:-User-Logout)
- [Architecture: Authentication](file:///Users/mac/Desktop/femil/tambola/_bmad-output/planning-artifacts/architecture.md#Authentication-&-Security)
- [BetterAuth Client](file:///Users/mac/Desktop/femil/tambola/src/lib/auth-client.ts)
- [Previous Story: Login](file:///Users/mac/Desktop/femil/tambola/_bmad-output/implementation-artifacts/1-3-user-login-with-credentials.md)

## Dev Agent Record

### Agent Model Used

Claude 4.5 Sonnet (2026-01-07)

### Debug Log References

N/A - Implementation completed without issues.

### Completion Notes List

- ✅ Created `LogoutButton.tsx` component with BetterAuth `signOut` integration
- ✅ Implemented loading state management with `useState`
- ✅ Added error handling with graceful degradation (redirects even if server logout fails)
- ✅ Conditional rendering - button only appears when user is logged in via `useSession` hook
- ✅ Integrated logout button into root layout (`src/app/layout.tsx`) with fixed top-right positioning
- ✅ Used shadcn/ui Button component with ghost variant and LogOut icon from lucide-react
- ✅ Redirect to landing page (`/`) after successful logout
- ✅ User confirmed manual testing successful - all acceptance criteria satisfied
  - Session destroyed on logout
  - Redirect to landing page works
  - Redirect to landing page works
  - Protected routes redirect to login after logout
- ✅ **Code Review Verified**: Middleware ensures correct session handling and redirection

### File List

- src/components/LogoutButton.tsx (new)
- src/app/layout.tsx (modified)
