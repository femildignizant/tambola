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

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <PlayPageClient
        gameId={game.id}
        gameTitle={game.title}
        numberInterval={game.numberInterval}
        initialCalledNumbers={game.calledNumbers}
        isHost={isHost}
      />
    </div>
  );
}

