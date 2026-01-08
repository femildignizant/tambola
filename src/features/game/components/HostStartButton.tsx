"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, Loader2, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { pusherClient } from "@/lib/pusher-client";

interface HostStartButtonProps {
  gameId: string;
  currentPlayerCount: number;
  minPlayers: number;
  isHost: boolean;
}

export function HostStartButton({
  gameId,
  currentPlayerCount: initialCount,
  minPlayers,
  isHost,
}: HostStartButtonProps) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canStart = count >= minPlayers;
  const playersNeeded = minPlayers - count;

  useEffect(() => {
    // Keep local count in sync if prop changes (though less likely in this context)
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    if (!gameId) return;

    const channel = pusherClient.subscribe(`game-${gameId}`);

    channel.bind("player:joined", () => {
      setCount((prev) => {
        const newCount = prev + 1;
        toast.success(`Player joined! Total: ${newCount}`);
        return newCount;
      });
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`game-${gameId}`);
    };
  }, [gameId]);

  const handleStartGame = async () => {
    if (!canStart || !isHost) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/games/${gameId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to start game");
      }

      toast.success("Game is starting!");

      // Add a small delay before redirect to show the success message
      setTimeout(() => {
        router.push(`/game/${gameId}/play`);
      }, 500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start game";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render anything if user is not the host
  if (!isHost) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Player count status */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Players ready:</span>
        <span
          className={`font-semibold ${
            canStart
              ? "text-green-600 dark:text-green-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {count} / {minPlayers}
          {canStart ? " ✓" : ""}
        </span>
      </div>

      {/* Start button with tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              <Button
                onClick={handleStartGame}
                disabled={!canStart || isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Game
                  </>
                )}
              </Button>
            </div>
          </TooltipTrigger>
          {!canStart && (
            <TooltipContent>
              <p>
                Waiting for {playersNeeded} more player
                {playersNeeded > 1 ? "s" : ""}
              </p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* Waiting message when not enough players */}
      {!canStart && (
        <p className="text-center text-sm text-muted-foreground">
          Need {playersNeeded} more player
          {playersNeeded > 1 ? "s" : ""} to start
        </p>
      )}

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
