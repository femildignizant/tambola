import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PatternConfigForm } from "@/features/game/components/PatternConfigForm";
import { GameSettingsForm } from "@/features/game/components/GameSettingsForm";
import { InviteGame } from "@/features/game/components/InviteGame";
import { HostStartButton } from "@/features/game/components/HostStartButton";
import { HostLayout } from "@/components/layouts/HostLayout";
import { PageHeader } from "@/components/layouts/PageHeader";
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
      _count: {
        select: {
          players: true,
        },
      },
    },
  });

  if (!game) {
    notFound();
  }

  if (game.hostId !== session.user.id) {
    return (
      <HostLayout showBackToDashboard>
        <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You are not the host of this game.
          </p>
        </div>
      </HostLayout>
    );
  }

  const settingsValues = {
    numberInterval: game.numberInterval as 7 | 10 | 15,
    minPlayers: game.minPlayers,
    maxPlayers: game.maxPlayers,
  };

  return (
    <HostLayout showBackToDashboard>
      <PageHeader
        title="Game Configuration"
        subtitle={
          <>
            Configure settings and winning patterns for{" "}
            <span className="font-semibold text-foreground">
              {game.title}
            </span>
          </>
        }
      />

      <div className="grid gap-6">
        <div className="flex flex-col gap-6 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
          <h2 className="text-xl font-semibold">Game Controls</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <InviteGame gameId={gameId} gameCode={game.gameCode} />
            <div className="flex flex-col justify-center">
              <HostStartButton
                gameId={game.id}
                currentPlayerCount={game._count.players}
                minPlayers={game.minPlayers}
                isHost={true}
              />
            </div>
          </div>
        </div>

        <GameSettingsForm
          gameId={gameId}
          initialValues={settingsValues}
        />
        <PatternConfigForm
          gameId={gameId}
          initialPatterns={game.patterns}
        />
      </div>
    </HostLayout>
  );
}
