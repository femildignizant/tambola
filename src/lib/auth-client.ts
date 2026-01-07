import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
});

export const { useSession, signUp, signIn, signOut } = authClient;

// Export authClient for password reset methods (requestPasswordReset, resetPassword)
export default authClient;
