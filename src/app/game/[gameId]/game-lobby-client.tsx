"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlayerJoinForm } from "@/features/game/components/PlayerJoinForm";
import { LobbyPlayerList } from "@/features/game/components/LobbyPlayerList";
import { TicketDisplay } from "@/features/game/components/TicketDisplay";
import { GameInfo } from "@/features/game/components/GameInfo";
import { useGameStore } from "@/features/game/game-store";
import { pusherClient } from "@/lib/pusher-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface GameData {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  status: "CONFIGURING" | "LOBBY" | "STARTED" | "COMPLETED";
  gameCode: string;
  numberInterval: number;
  minPlayers: number;
  maxPlayers: number;
  patterns: Array<{
    pattern: string;
    enabled: boolean;
    points1st: number;
    points2nd: number | null;
    points3rd: number | null;
  }>;
}

interface Player {
  id: string;
  name: string;
  joinedAt: string;
}

interface GameLobbyClientProps {
  gameData: GameData;
  initialPlayers: Player[];
}

export function GameLobbyClient({
  gameData,
  initialPlayers,
}: GameLobbyClientProps) {
  const router = useRouter();
  const { setGame, currentPlayer, setCurrentPlayer, addPlayer } =
    useGameStore();
  const [hasJoined, setHasJoined] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // Initialize game data in store
  useEffect(() => {
    setGame(gameData);
  }, [gameData, setGame]);

  // Define fetchPlayerData before it's used
  const fetchPlayerData = async (token: string) => {
    try {
      const response = await fetch(
        `/api/games/${gameData.id}/verify-player`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // Invalid token, clear it
        localStorage.removeItem(`game-${gameData.id}-token`);
        setIsCheckingToken(false);
        return;
      }

      const result = await response.json();

      // Set current player with their ticket data
      setCurrentPlayer({
        id: result.data.player.id,
        name: result.data.player.name,
        token: result.data.token,
        ticket: result.data.ticket,
      });

      setHasJoined(true);
      setIsCheckingToken(false);
    } catch (error) {
      console.error("Error fetching player data:", error);
      // Clear invalid token
      localStorage.removeItem(`game-${gameData.id}-token`);
      setIsCheckingToken(false);
    }
  };

  // Check if player has already joined (token in localStorage)
  useEffect(() => {
    const token = localStorage.getItem(`game-${gameData.id}-token`);
    if (token) {
      // Player has a token, fetch their data
      fetchPlayerData(token);
    } else {
      setIsCheckingToken(false);
    }
  }, [gameData.id]); // fetchPlayerData is stable, no need to include

  // Subscribe to Pusher events (centralized subscription)
  useEffect(() => {
    const channel = pusherClient.subscribe(`game-${gameData.id}`);

    // Handle connection state
    pusherClient.connection.bind("connected", () => {
      console.log("Pusher connected");
    });

    pusherClient.connection.bind("error", (err: Error) => {
      console.error("Pusher connection error:", err);
      // Could set an error state here to show connection issues to user
    });

    // Listen for game:started event
    channel.bind("game:started", () => {
      router.push(`/game/${gameData.id}/play`);
    });

    // Listen for player:joined event (centralized here instead of LobbyPlayerList)
    channel.bind("player:joined", (data: { player: Player }) => {
      addPlayer(data.player);
    });

    return () => {
      channel.unbind("game:started");
      channel.unbind("player:joined");
      pusherClient.connection.unbind("connected");
      pusherClient.connection.unbind("error");
      pusherClient.unsubscribe(`game-${gameData.id}`);
    };
  }, [gameData.id, router, addPlayer]);

  const handleJoinSuccess = (data: {
    player: { id: string; name: string; joinedAt: string };
    ticket: { id: string; grid: number[][] };
    token: string;
  }) => {
    setCurrentPlayer({
      id: data.player.id,
      name: data.player.name,
      token: data.token,
      ticket: data.ticket,
    });
    setHasJoined(true);
  };

  if (isCheckingToken) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Game Info Section */}
        <GameInfo
          title={gameData.title}
          hostName={gameData.hostName}
          gameCode={gameData.gameCode}
          numberInterval={gameData.numberInterval}
          minPlayers={gameData.minPlayers}
          maxPlayers={gameData.maxPlayers}
          patterns={gameData.patterns}
        />

        {/* Join Form or Lobby Content */}
        {!hasJoined ? (
          <div className="flex justify-center">
            <PlayerJoinForm
              gameId={gameData.id}
              onJoinSuccess={handleJoinSuccess}
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column: Ticket Display */}
            {currentPlayer?.ticket && (
              <TicketDisplay
                grid={currentPlayer.ticket.grid}
                playerName={currentPlayer.name}
              />
            )}

            {/* Right Column: Player List */}
            <LobbyPlayerList
              gameId={gameData.id}
              initialPlayers={initialPlayers}
              maxPlayers={gameData.maxPlayers}
              currentPlayerId={currentPlayer?.id}
            />
          </div>
        )}

        {/* Waiting Message */}
        {hasJoined && (
          <Alert>
            <AlertDescription className="text-center">
              Waiting for host to start the game...
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
