"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
// Subscribe to Pusher events logic moved to GameLobbyClient to prevent connection race conditions
import { useGameStore } from "../game-store";

interface LobbyPlayerListProps {
  maxPlayers: number;
  currentPlayerId?: string;
}

export function LobbyPlayerList({
  maxPlayers,
  currentPlayerId,
}: LobbyPlayerListProps) {
  const { players } = useGameStore();

  // Player initialization is now handled by GameLobbyClient to prevent overwriting local state
  // when this component mounts after joining

  // Player joining updates are handled by parent GameLobbyClient via store updates

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
                className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                  player.id === currentPlayerId
                    ? "bg-primary/5 border-foreground"
                    : "bg-muted/50 border-transparent"
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
