"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/features/game/game-store";
import { Ticket } from "@/features/game/components/Ticket";
import { NumberDisplay } from "@/features/game/components/NumberDisplay";
import { NumberHistory } from "@/features/game/components/NumberHistory";
import { AllNumbersGrid } from "@/features/game/components/AllNumbersGrid";
import { useNumberAnnouncer } from "@/features/game/hooks/useNumberAnnouncer";
import { ClaimModal } from "@/features/game/components/ClaimModal";
import { Leaderboard } from "@/features/game/components/Leaderboard";
import { PatternStatusList } from "@/features/game/components/PatternStatusList";
import { pusherClient } from "@/lib/pusher-client";
import {
  Loader2,
  Volume2,
  VolumeX,
  Trophy,
  StopCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type {
  PlayPageClientProps,
  NumberCalledEvent,
  GameEndedEvent,
} from "@/types/events";

interface ClaimAcceptedEvent {
  claim: {
    id: string;
    playerId: string;
    playerName: string;
    pattern: string;
    rank: number;
    points: number;
    claimedAt: string;
  };
}

export function PlayPageClient({
  gameId,
  gameTitle,
  numberInterval = 10,
  initialCalledNumbers = [],
  isHost = false,
  gameData,
}: PlayPageClientProps) {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    currentPlayer,
    setCurrentPlayer,
    calledNumbers,
    isGameEnded,
    addCalledNumber,
    setCalledNumbers,
    currentNumber,
    gameSequence,
    setGameEnded,
    setMarkedNumbers,
    setGame,
  } = useGameStore();

  const { isMuted, toggleMute, announceNumber } =
    useNumberAnnouncer();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isEndingGame, setIsEndingGame] = useState(false);

  // Initialize with server state
  useEffect(() => {
    if (gameData) {
      setGame(gameData);
    }
    if (initialCalledNumbers.length > 0) {
      setCalledNumbers(initialCalledNumbers);
    }
  }, [initialCalledNumbers, setCalledNumbers, gameData, setGame]);

  const isCallingRef = useRef(false);

  // Call next number from the API with retry for race conditions
  const callNextNumber = useCallback(
    async (retryCount = 0) => {
      const MAX_RETRIES = 3;
      if (isCallingRef.current || isGameEnded) return;

      isCallingRef.current = true;
      try {
        const response = await fetch(
          `/api/games/${gameId}/call-number`,
          {
            method: "POST",
          }
        );

        if (response.status === 409 && retryCount < MAX_RETRIES) {
          // Race condition detected - retry after small delay
          isCallingRef.current = false;
          const delay = Math.min(100 * Math.pow(2, retryCount), 1000);
          setTimeout(() => callNextNumber(retryCount + 1), delay);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          // Only log non-race-condition errors
          if (response.status !== 409) {
            console.error("Failed to call number:", errorData.error);
          }
        }
        // Response handling is via Pusher, no need to process here
      } catch (err) {
        console.error("Failed to call number:", err);
      } finally {
        isCallingRef.current = false;
      }
    },
    [gameId, isGameEnded]
  );

  // Host-only: End game early
  const handleEndGame = useCallback(async () => {
    if (!isHost || isEndingGame || isGameEnded) return;

    setIsEndingGame(true);
    try {
      const response = await fetch(`/api/games/${gameId}/end`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to end game");
        return;
      }

      toast.success("Game ended successfully");
      // Navigation will be handled by Pusher event
    } catch (err) {
      console.error("Failed to end game:", err);
      toast.error("Failed to end game");
    } finally {
      setIsEndingGame(false);
    }
  }, [gameId, isHost, isEndingGame, isGameEnded]);

  // Subscribe to Pusher events
  useEffect(() => {
    const channel = pusherClient.subscribe(`game-${gameId}`);
    const { addClaimedPattern } = useGameStore.getState();

    channel.bind("number:called", (data: NumberCalledEvent) => {
      addCalledNumber(data.number, data.sequence);
      announceNumber(data.number);
    });

    channel.bind("claim:accepted", (data: ClaimAcceptedEvent) => {
      addClaimedPattern({
        pattern: data.claim.pattern,
        rank: data.claim.rank,
        points: data.claim.points,
        playerId: data.claim.playerId,
        playerName: data.claim.playerName,
        claimedAt: data.claim.claimedAt,
      });

      // Show global announcement
      toast(
        <div className="flex flex-col gap-1">
          <p className="font-bold">
            {data.claim.playerName} claimed{" "}
            {data.claim.pattern.replace(/_/g, " ")}!
          </p>
          <p className="text-sm text-muted-foreground">
            +{data.claim.points} points (Rank #{data.claim.rank})
          </p>
        </div>,
        {
          duration: 5000,
          position: "top-center",
          icon: <Trophy className="h-5 w-5 text-yellow-500" />,
        }
      );
    });

    channel.bind("game:ended", (data: GameEndedEvent) => {
      setGameEnded();

      // Stop the polling interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Show appropriate toast message based on reason
      if (data.reason === "FULL_HOUSE" && data.winner) {
        toast(
          <div className="flex flex-col gap-1">
            <p className="font-bold text-lg">🎉 Game Over!</p>
            <p className="text-sm">
              {data.winner.playerName} won with Full House!
            </p>
            <p className="text-sm text-muted-foreground">
              +{data.winner.points} points
            </p>
          </div>,
          {
            duration: 5000,
            position: "top-center",
          }
        );
      } else if (data.reason === "FORCE_STOP") {
        toast.info("Game ended by host", {
          description: "The host has ended the game.",
          duration: 4000,
          position: "top-center",
        });
      } else {
        toast.info("Game completed", {
          description: "All 90 numbers have been called!",
          duration: 4000,
          position: "top-center",
        });
      }

      // Redirect to results page after short delay
      setTimeout(() => {
        router.push(`/game/${gameId}/results`);
      }, 3000);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`game-${gameId}`);
    };
  }, [gameId, addCalledNumber, setGameEnded, router, announceNumber]);

  // Host-only: Start the number calling loop
  useEffect(() => {
    if (isHost && !isGameEnded && !loading) {
      // If no numbers called yet, do the initial countdown
      if (calledNumbers.length === 0) {
        const initialDelay = setTimeout(() => {
          callNextNumber();
        }, 3000); // 3 second countdown before first number

        return () => clearTimeout(initialDelay);
      }

      // Otherwise, run the regular interval
      // This will start AFTER the first number is called and state updates
      intervalRef.current = setInterval(
        callNextNumber,
        numberInterval * 1000
      );

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [
    isHost,
    isGameEnded,
    loading,
    numberInterval,
    callNextNumber,
    calledNumbers.length,
  ]);

  // Fetch player data on mount
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const token = localStorage.getItem(`game-${gameId}-token`);

        if (!token) {
          if (isHost) {
            // Host does not need a token if they haven't joined as a player
            setLoading(false);
            return;
          }
          setError(
            "No player token found. Please join the game from the lobby."
          );
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/games/${gameId}/verify-player`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to verify player session");
        }

        const result = await response.json();

        setCurrentPlayer({
          id: result.data.player.id,
          name: result.data.player.name,
          token: result.data.token,
          ticket: result.data.ticket,
        });

        // Sync marked numbers
        if (result.data.ticket.markedNumbers) {
          setMarkedNumbers(result.data.ticket.markedNumbers);
        }
      } catch (err) {
        console.error(err);
        setError(
          "Failed to load player data. Please return to lobby."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [gameId, setCurrentPlayer, isHost, setMarkedNumbers]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          Loading game interface...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {gameTitle}
        </h1>
        <p className="text-muted-foreground">
          {isGameEnded ? "Game Completed" : "Game in Progress"}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          {/* Only show ticket to players, not hosts */}
          {!isHost && currentPlayer?.ticket && (
            <Ticket grid={currentPlayer.ticket.grid} />
          )}
          <PatternStatusList />
          <Leaderboard />
        </div>

        {/* Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Number Display */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Current Number</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <NumberDisplay currentNumber={currentNumber} />
                <p className="text-muted-foreground mt-4">
                  {gameSequence} / 90 numbers called
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Called Numbers History - Hosts see all, players see last 10 */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isHost ? "All Called Numbers" : "Last 10 Numbers"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isHost ? (
                <AllNumbersGrid calledNumbers={calledNumbers} />
              ) : (
                <NumberHistory calledNumbers={calledNumbers} />
              )}
            </CardContent>
          </Card>

          {/* Game Status Alert */}
          {isGameEnded ? (
            <Alert>
              <AlertTitle>Game Over!</AlertTitle>
              <AlertDescription>
                All 90 numbers have been called. Redirecting to
                results...
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {/* Only show claim button to players, not hosts */}
              {!isHost && (
                <Button
                  onClick={() => setIsClaimModalOpen(true)}
                  className="w-full"
                  size="lg"
                  variant="default"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  Claim Prize
                </Button>
              )}

              {/* Host-only: End Game button with confirmation */}
              {isHost && !isGameEnded && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full"
                      size="lg"
                      variant="destructive"
                      disabled={isEndingGame}
                    >
                      {isEndingGame ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <StopCircle className="h-5 w-5 mr-2" />
                      )}
                      {isEndingGame ? "Ending Game..." : "End Game"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        End Game Early?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will immediately end the game for all
                        players. Winners will be determined based on
                        current claims. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleEndGame}>
                        End Game Now
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Alert>
                <AlertTitle>Status</AlertTitle>
                <AlertDescription>
                  {isHost
                    ? "You are the host. Numbers are being called automatically."
                    : "The game has started. Good luck!"}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </div>

      <ClaimModal
        gameId={gameId}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
      />
    </div>
  );
}
