import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { PlayPageClient } from "@/features/game/components/PlayPageClient";

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export default async function PlayPage(props: PageProps) {
  const params = await props.params;
  const { gameId } = params;

  // Get current user session for host check
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: {
      id: true,
      title: true,
      status: true,
      hostId: true,
      numberInterval: true,
      calledNumbers: true,
      gameCode: true,
      minPlayers: true,
      maxPlayers: true,
      host: {
        select: {
          name: true,
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

  if (!game) {
    notFound();
  }

  // Redirect to lobby if game hasn't started yet
  if (game.status === "CONFIGURING" || game.status === "LOBBY") {
    redirect(`/game/${gameId}`);
  }

  // Determine if current user is the host
  const isHost = session?.user?.id === game.hostId;

  // Prepare game data for client component with pattern info
  const gameData = {
    id: game.id,
    title: game.title,
    hostId: game.hostId,
    hostName: game.host.name,
    status: game.status,
    gameCode: game.gameCode,
    numberInterval: game.numberInterval,
    minPlayers: game.minPlayers,
    maxPlayers: game.maxPlayers,
    patterns: game.patterns,
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <PlayPageClient
        gameId={game.id}
        gameTitle={game.title}
        numberInterval={game.numberInterval}
        initialCalledNumbers={game.calledNumbers}
        isHost={isHost}
        gameData={gameData}
      />
    </div>
  );
}
