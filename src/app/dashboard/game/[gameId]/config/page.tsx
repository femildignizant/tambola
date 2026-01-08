import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PatternConfigForm } from "@/features/game/components/PatternConfigForm";
import { GameSettingsForm } from "@/features/game/components/GameSettingsForm";
import { InviteGame } from "@/features/game/components/InviteGame";
import { headers } from "next/headers";

import { redirect, notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export default async function GameConfigPage(props: PageProps) {
  const params = await props.params;
  const { gameId } = params;

  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/login");
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      patterns: true,
    },
  });

  if (!game) {
    notFound();
  }

  if (game.hostId !== session.user.id) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-destructive">
          Access Denied
        </h1>
        <p className="text-muted-foreground">
          You are not the host of this game.
        </p>
      </div>
    );
  }

  const settingsValues = {
    numberInterval: game.numberInterval as 7 | 10 | 15,
    minPlayers: game.minPlayers,
    maxPlayers: game.maxPlayers,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Game Configuration
        </h1>
        <p className="text-muted-foreground">
          Configure settings and winning patterns for{" "}
          <span className="font-semibold text-foreground">
            {game.title}
          </span>
        </p>
      </div>

      <div className="grid gap-6">
        <InviteGame gameId={gameId} gameCode={game.gameCode} />
        <GameSettingsForm
          gameId={gameId}
          initialValues={settingsValues}
        />
        <PatternConfigForm
          gameId={gameId}
          initialPatterns={game.patterns}
        />
      </div>
    </div>
  );
}
