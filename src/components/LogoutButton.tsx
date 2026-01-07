"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Don't render if user is not logged in
  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
          onError: (error) => {
            console.error("Logout failed:", error);
            // Still redirect even if server-side logout fails
            router.push("/");
          },
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Graceful degradation: redirect to landing page anyway
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
