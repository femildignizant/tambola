"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/features/game/game-store";
import { TicketDisplay } from "@/features/game/components/TicketDisplay";
import { pusherClient } from "@/lib/pusher-client";
import { Loader2, Volume2, VolumeX } from "lucide-react";
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

interface PlayPageClientProps {
  gameId: string;
  gameTitle: string;
  numberInterval?: number;
  initialCalledNumbers?: number[];
  isHost?: boolean;
}

interface NumberCalledEvent {
  number: number;
  sequence: number;
  timestamp: string;
  remaining: number;
}

interface GameEndedEvent {
  reason: "ALL_NUMBERS_CALLED" | "FULL_HOUSE_CLAIMED";
  finalSequence: number;
  completedAt: string;
}

export function PlayPageClient({
  gameId,
  gameTitle,
  numberInterval = 10,
  initialCalledNumbers = [],
  isHost = false,
}: PlayPageClientProps) {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    currentPlayer,
    setCurrentPlayer,
    calledNumbers,
    currentNumber,
    gameSequence,
    isGameEnded,
    addCalledNumber,
    setCalledNumbers,
    setGameEnded,
  } = useGameStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCallingNumber, setIsCallingNumber] = useState(false);

  // Initialize with server state
  useEffect(() => {
    if (initialCalledNumbers.length > 0) {
      setCalledNumbers(initialCalledNumbers);
    }
  }, [initialCalledNumbers, setCalledNumbers]);

  // Call next number from the API
  const callNextNumber = useCallback(async () => {
    if (isCallingNumber || isGameEnded) return;

    setIsCallingNumber(true);
    try {
      const response = await fetch(`/api/games/${gameId}/call-number`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to call number:", errorData.error);
      }
      // Response handling is via Pusher, no need to process here
    } catch (err) {
      console.error("Failed to call number:", err);
    } finally {
      setIsCallingNumber(false);
    }
  }, [gameId, isCallingNumber, isGameEnded]);

  // Subscribe to Pusher events
  useEffect(() => {
    const channel = pusherClient.subscribe(`game-${gameId}`);

    channel.bind("number:called", (data: NumberCalledEvent) => {
      addCalledNumber(data.number, data.sequence);

      // Play sound if not muted
      if (!isMuted) {
        // Sound will be implemented in Story 4.2
      }
    });

    channel.bind("game:ended", (data: GameEndedEvent) => {
      setGameEnded();

      // Stop the polling interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
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
  }, [gameId, addCalledNumber, setGameEnded, router, isMuted]);

  // Host-only: Start the number calling loop
  useEffect(() => {
    if (isHost && !isGameEnded && !loading) {
      // Start calling numbers at the configured interval
      intervalRef.current = setInterval(
        callNextNumber,
        numberInterval * 1000
      );

      // Call the first number immediately after a short delay
      const initialDelay = setTimeout(() => {
        callNextNumber();
      }, 3000); // 3 second countdown before first number

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        clearTimeout(initialDelay);
      };
    }
  }, [isHost, isGameEnded, loading, numberInterval, callNextNumber]);

  // Fetch player data on mount
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const token = localStorage.getItem(`game-${gameId}-token`);

        if (!token) {
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
  }, [gameId, setCurrentPlayer]);

  // Get last 10 called numbers for history display
  const calledNumbersHistory = calledNumbers.slice(-10).reverse();

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
        {/* Ticket Section */}
        <div className="lg:col-span-1">
          {currentPlayer?.ticket && (
            <TicketDisplay
              grid={currentPlayer.ticket.grid}
              playerName={currentPlayer.name}
            />
          )}
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
                onClick={() => setIsMuted(!isMuted)}
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
                {currentNumber ? (
                  <div className="text-8xl font-bold text-primary animate-pulse">
                    {currentNumber}
                  </div>
                ) : (
                  <div className="text-2xl text-muted-foreground">
                    Waiting for first number...
                  </div>
                )}
                <p className="text-muted-foreground mt-4">
                  {gameSequence} / 90 numbers called
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Called Numbers History */}
          <Card>
            <CardHeader>
              <CardTitle>Last 10 Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              {calledNumbersHistory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {calledNumbersHistory.map((num, index) => (
                    <div
                      key={num}
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                        ${index === 0 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No numbers called yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Game Status Alert */}
          {isGameEnded ? (
            <Alert>
              <AlertTitle>Game Over!</AlertTitle>
              <AlertDescription>
                All 90 numbers have been called. Redirecting to results...
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertTitle>Status</AlertTitle>
              <AlertDescription>
                {isHost
                  ? "You are the host. Numbers are being called automatically."
                  : "The game has started. Good luck!"}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

