import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { GameLobbyClient } from "./game-lobby-client";

interface PageProps {
  params: Promise<{
    gameId: string;
  }>;
}

export default async function GameLobbyPage({ params }: PageProps) {
  const { gameId } = await params;

  // Fetch game data with all related information
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      host: {
        select: {
          id: true,
          name: true,
        },
      },
      players: {
        select: {
          id: true,
          name: true,
          joinedAt: true,
        },
        orderBy: {
          joinedAt: "asc",
        },
      },
      patterns: {
        where: {
          enabled: true,
        },
        select: {
          pattern: true,
          enabled: true,
          points1st: true,
          points2nd: true,
          points3rd: true,
        },
      },
    },
  });

  // Handle game not found
  if (!game) {
    notFound();
  }

  // Handle game state routing
  if (game.status === "STARTED") {
    // Redirect to play page when game has started
    redirect(`/game/${gameId}/play`);
  }

  if (game.status === "COMPLETED") {
    // Redirect to results page when game is completed
    redirect(`/game/${gameId}/results`);
  }

  // Prepare game data for client component
  const gameData = {
    id: game.id,
    title: game.title,
    hostId: game.host.id,
    hostName: game.host.name,
    status: game.status,
    gameCode: game.gameCode,
    numberInterval: game.numberInterval,
    minPlayers: game.minPlayers,
    maxPlayers: game.maxPlayers,
    patterns: game.patterns,
  };

  const players = game.players.map((player) => ({
    id: player.id,
    name: player.name,
    joinedAt: player.joinedAt.toISOString(),
  }));

  return (
    <GameLobbyClient gameData={gameData} initialPlayers={players} />
  );
}
