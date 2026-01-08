"use client";

import { useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { pusherClient } from "@/lib/pusher-client";
import { useGameStore } from "../game-store";

interface Player {
  id: string;
  name: string;
  joinedAt: string;
}

interface LobbyPlayerListProps {
  gameId: string;
  initialPlayers: Player[];
  maxPlayers: number;
  currentPlayerId?: string;
}

export function LobbyPlayerList({
  gameId,
  initialPlayers,
  maxPlayers,
  currentPlayerId,
}: LobbyPlayerListProps) {
  const { players, setPlayers, addPlayer } = useGameStore();

  // Initialize players from server-side data
  useEffect(() => {
    setPlayers(initialPlayers);
  }, [initialPlayers, setPlayers]);

  // Memoize the player joined handler
  const handlePlayerJoined = useCallback(
    (data: { player: Player }) => {
      // Check if player already exists to prevent duplicates
      addPlayer(data.player); // The store's addPlayer should handle deduplication
    },
    [addPlayer]
  );

  // Subscribe to Pusher events for real-time updates
  useEffect(() => {
    const channel = pusherClient.subscribe(`game-${gameId}`);

    channel.bind("player:joined", handlePlayerJoined);

    return () => {
      channel.unbind("player:joined");
      pusherClient.unsubscribe(`game-${gameId}`);
    };
  }, [gameId, handlePlayerJoined]);

  const formatJoinTime = (joinedAt: string) => {
    const date = new Date(joinedAt);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Players
          </CardTitle>
          <Badge variant="secondary">
            {players.length} / {maxPlayers}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Waiting for players to join...
          </p>
        ) : (
          <ul className="space-y-2">
            {players.map((player) => (
              <li
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  player.id === currentPlayerId
                    ? "bg-primary/10 border-primary"
                    : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{player.name}</span>
                  {player.id === currentPlayerId && (
                    <Badge variant="outline" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatJoinTime(player.joinedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
