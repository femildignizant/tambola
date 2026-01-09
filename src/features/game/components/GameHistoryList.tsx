"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { History, Plus, GamepadIcon } from "lucide-react";
import { GameHistoryCard } from "./GameHistoryCard";
import { Pattern } from "@/generated/prisma/client";

interface GameHistoryClaim {
  pattern: Pattern;
  rank: number;
  points: number;
}

interface GameHistoryItem {
  id: string;
  title: string;
  hostName: string;
  isHost: boolean;
  completedAt: string | null;
  playerCount: number;
  status: "won" | "participated" | "host-only";
  totalPoints: number;
  claims: GameHistoryClaim[];
}

export function GameHistoryList() {
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch("/api/games/history");
        if (response.ok) {
          const result = await response.json();
          // Validate response structure before accessing
          if (result && Array.isArray(result.data)) {
            setHistory(result.data);
          } else {
            setError("Invalid response format from server");
          }
        } else {
          const errorData = await response.json().catch(() => null);
          setError(
            errorData?.error || "Failed to fetch game history"
          );
        }
      } catch (err) {
        console.error("Failed to load game history", err);
        setError("An error occurred loading game history");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No game history yet</h3>
        <p className="text-muted-foreground mt-2 mb-6">
          Play or host a game to see your history here.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard/create">
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" /> Create Game
            </Button>
          </Link>
          <Link href="/join">
            <Button variant="outline">
              <GamepadIcon className="mr-2 h-4 w-4" /> Join Game
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {history.map((game) => (
        <GameHistoryCard key={game.id} {...game} />
      ))}
    </div>
  );
}
