"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GameStatus } from "@/generated/prisma/client";

interface Game {
  id: string;
  title: string;
  status: GameStatus;
  createdAt: string;
  minPlayers: number;
  maxPlayers: number;
  gameCode: string;
  // _count: { players: number }; // Re-enable when relation exists
}

export function GameList() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch("/api/games");
        if (response.ok) {
          const data = await response.json();
          setGames(data.data);
        } else {
          setError("Failed to fetch games");
        }
      } catch (error) {
        console.error("Failed to load games", error);
        setError("An error occurred loading games");
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
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

  if (games.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium">No games found</h3>
        <p className="text-muted-foreground mt-2 mb-6">
          Create your first game to get started.
        </p>
        <Link href="/dashboard/create">
          <Button>Create New Game</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <Card
          key={game.id}
          className="hover:bg-muted/50 transition-colors"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold truncate">
              {game.title}
            </CardTitle>
            <StatusBadge status={game.status} />
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mt-2">
              <div className="flex justify-between py-1">
                <span>Code:</span>
                <span className="font-mono font-medium">
                  {game.gameCode}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Created:</span>
                <span>
                  {new Date(game.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-1">
                {/* Placeholder for player count */}
                <span>Players:</span>
                <span>-</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Link href={`/dashboard/game/${game.id}/config`}>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: GameStatus }) {
  const variant =
    {
      CONFIGURING: "secondary",
      LOBBY: "default",
      STARTED: "default", // Should ideally be distinct (e.g. green)
      COMPLETED: "outline", // Should be destructive or plain
    }[status] || "default";

  // Mapping variant string to Badge variant type if needed,
  // assuming shadcn Badge supports: default, secondary, destructive, outline

  return (
    <Badge
      variant={
        variant as
          | "default"
          | "secondary"
          | "destructive"
          | "outline"
          | null
          | undefined
      }
    >
      {status}
    </Badge>
  );
}
