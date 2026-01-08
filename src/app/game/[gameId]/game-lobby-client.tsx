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
  const {
    game,
    setGame,
    currentPlayer,
    setCurrentPlayer,
    addPlayer,
  } = useGameStore();
  const [hasJoined, setHasJoined] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // Initialize game data and players in store
  useEffect(() => {
    setGame(gameData);
    // Only set initial players if the store is empty to avoid overwriting real-time updates
    // or better: just set them initially.
    // Actually, purely setting them here is safe because this component mounts once.
    // However, we should be careful not to overwrite if we re-render with same props but have new store data?
    // Since initialPlayers prop comes from server page, it's static for this client instance until refresh.
    // We should probably only set it once on mount.
    // But React Strict Mode might run this twice.
    // Let's use a ref or check if we already have players?
    // Actually, setPlayers(initialPlayers) on mount is fine as long as it happens BEFORE we join.
    // This effect runs on mount. When user joins, state updates.
    // If this effect re-runs, it might be an issue.
    // It depends on gameData/setGame dependencies.
    // Let's make a separate effect for players to be safe and only run it once or when initialPlayers changes deeply?
    // Actually, simplest is just to set it here.
    useGameStore.getState().setPlayers(initialPlayers);
  }, [gameData, setGame, initialPlayers]);

  // Check if player has already joined (token in localStorage)
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

    const token = localStorage.getItem(`game-${gameData.id}-token`);
    if (token) {
      fetchPlayerData(token);
    } else {
      setIsCheckingToken(false);
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
      // Could set an error state here to show connection issues to user
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

    // Listen for player:joined event (centralized here instead of LobbyPlayerList)
    channel.bind("player:joined", (data: { player: Player }) => {
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
    // Add self to the players list immediately
    addPlayer({
      id: data.player.id,
      name: data.player.name,
      joinedAt: data.player.joinedAt,
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

  // Use the reactive game state from store for rendering, falling back to initial data if needed
  const activeGame = game || gameData;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Game Info Section */}
        <GameInfo
          title={activeGame.title}
          hostName={activeGame.hostName}
          gameCode={activeGame.gameCode}
          numberInterval={activeGame.numberInterval}
          minPlayers={activeGame.minPlayers}
          maxPlayers={activeGame.maxPlayers}
          patterns={activeGame.patterns}
          gameId={activeGame.id}
        />

        {/* Join Form or Lobby Content */}
        {!hasJoined ? (
          <div className="flex justify-center">
            <PlayerJoinForm
              gameId={activeGame.id}
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
              maxPlayers={activeGame.maxPlayers}
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
