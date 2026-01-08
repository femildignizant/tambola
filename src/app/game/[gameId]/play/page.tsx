import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { PlayPageClient } from "@/features/game/components/PlayPageClient";

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export default async function PlayPage(props: PageProps) {
  const params = await props.params;
  const { gameId } = params;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    notFound();
  }

  // Redirect to lobby if game hasn't started yet
  if (game.status === "CONFIGURING" || game.status === "LOBBY") {
    redirect(`/game/${gameId}`);
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <PlayPageClient gameId={game.id} gameTitle={game.title} />
    </div>
  );
}
