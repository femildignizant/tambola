"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/features/game/game-store";
import { TicketDisplay } from "@/features/game/components/TicketDisplay";
import { Loader2 } from "lucide-react";
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

interface PlayPageClientProps {
  gameId: string;
  gameTitle: string;
}

export function PlayPageClient({
  gameId,
  gameTitle,
}: PlayPageClientProps) {
  const { currentPlayer, setCurrentPlayer } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // If we already have the player in store and it matches, we might skip fetch
        // But for reliability on refresh, we verify.

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
        <p className="text-muted-foreground">Game in Progress</p>
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

        {/* Game Area Placeholder */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Number Calling Area</CardTitle>
            </CardHeader>
            <CardContent className="h-48 flex items-center justify-center bg-muted/20">
              <p className="text-muted-foreground text-center">
                Reviewer Note: Number calling and board display will
                be implemented in Epic 4.
                <br />
                Wait for the host to call numbers!
              </p>
            </CardContent>
          </Card>

          <Alert>
            <AlertTitle>Status</AlertTitle>
            <AlertDescription>
              The game has started. Good luck!
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
