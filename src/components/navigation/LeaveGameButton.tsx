"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaveGameButtonProps {
  gameId: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
}

/**
 * LeaveGameButton - Consistent leave game functionality with confirmation
 *
 * Provides a button to leave the game with a confirmation dialog.
 * Redirects to dashboard after leaving.
 */
export function LeaveGameButton({
  gameId,
  className,
  variant = "outline",
}: LeaveGameButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  const handleLeave = () => {
    // Clear any game-related state
    // In a real implementation, you might want to call an API to remove the player
    router.push("/dashboard");
  };

  return (
    <>
      <Button
        variant={variant}
        onClick={() => setShowDialog(true)}
        className={cn("gap-2", className)}
      >
        <LogOut className="h-4 w-4" />
        Leave Game
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Game?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this game? You may not be
              able to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeave}>
              Leave Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
