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
import { GameLayout } from "@/components/layouts/GameLayout";

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
  const {
    game,
    setGame,
    currentPlayer,
    setCurrentPlayer,
    addPlayer,
  } = useGameStore();
  const [hasJoined, setHasJoined] = useState(false);
  // Always start with true to match server-rendered HTML and avoid hydration mismatch
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // Initialize game data and players in store
  useEffect(() => {
    setGame(gameData);
    useGameStore.getState().setPlayers(initialPlayers);
  }, [gameData, setGame, initialPlayers]);

  // Check if player has already joined (token in localStorage)
  // This runs after hydration so it's safe to access localStorage
  useEffect(() => {
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
          localStorage.removeItem(`game-${gameData.id}-token`);
          setIsCheckingToken(false);
          return;
        }

        const result = await response.json();

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
        localStorage.removeItem(`game-${gameData.id}-token`);
        setIsCheckingToken(false);
      }
    };

    // Check localStorage after mount (client-side only)
    const token = localStorage.getItem(`game-${gameData.id}-token`);
    if (token) {
      fetchPlayerData(token);
    } else {
      // No token exists, stop checking - use queueMicrotask to avoid sync setState in effect
      queueMicrotask(() => setIsCheckingToken(false));
    }
  }, [gameData.id, setCurrentPlayer]);

  // Subscribe to Pusher events (centralized subscription)
  useEffect(() => {
    console.log(
      `🔌 Subscribing to Pusher channel: game-${gameData.id}`
    );
    const channel = pusherClient.subscribe(`game-${gameData.id}`);

    // Handle connection state
    pusherClient.connection.bind("connected", () => {
      console.log("Pusher connected");
    });

    pusherClient.connection.bind("error", (err: Error) => {
      console.error("Pusher connection error:", err);
    });

    // Listen for game:started event
    channel.bind("game:started", () => {
      router.push(`/game/${gameData.id}/play`);
    });

    // Listen for game:updated event
    channel.bind("game:updated", (data: { data: GameData }) => {
      console.log("🎮 Client received game:updated event:", data);
      setGame(data.data);
    });

    // Listen for player:joined event
    channel.bind("player:joined", (data: { player: Player }) => {
      console.log("👤 Client received player:joined event:", data);
      addPlayer(data.player);
    });

    return () => {
      channel.unbind("game:started");
      channel.unbind("game:updated");
      channel.unbind("player:joined");
      pusherClient.connection.unbind("connected");
      pusherClient.connection.unbind("error");
      pusherClient.unsubscribe(`game-${gameData.id}`);
    };
  }, [gameData.id, router, addPlayer, setGame]);

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
    addPlayer({
      id: data.player.id,
      name: data.player.name,
      joinedAt: data.player.joinedAt,
    });
    setHasJoined(true);
  };

  const activeGame = game || gameData;

  return (
    <GameLayout
      gameId={activeGame.id}
      gameCode={activeGame.gameCode}
      showLeaveButton={hasJoined}
    >
      {isCheckingToken ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <GameInfo
            gameCode={activeGame.gameCode}
            numberInterval={activeGame.numberInterval}
            minPlayers={activeGame.minPlayers}
            maxPlayers={activeGame.maxPlayers}
            patterns={activeGame.patterns}
            gameId={activeGame.id}
          />

          {!hasJoined ? (
            <div className="flex justify-center">
              <PlayerJoinForm
                gameId={activeGame.id}
                onJoinSuccess={handleJoinSuccess}
              />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {currentPlayer?.ticket && (
                <TicketDisplay
                  grid={currentPlayer.ticket.grid}
                  playerName={currentPlayer.name}
                />
              )}

              <LobbyPlayerList
                maxPlayers={activeGame.maxPlayers}
                currentPlayerId={currentPlayer?.id}
              />
            </div>
          )}

          {hasJoined && (
            <Alert>
              <AlertDescription className="text-center">
                Waiting for host to start the game...
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </GameLayout>
  );
}
