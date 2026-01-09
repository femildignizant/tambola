import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ResultsPageClient } from "./results-page-client";

interface ResultsPageProps {
  params: Promise<{ gameId: string }>;
}

export default async function ResultsPage({
  params,
}: ResultsPageProps) {
  const { gameId } = await params;

  // Auth check - user must be logged in
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: {
      id: true,
      title: true,
      status: true,
      completedAt: true,
      currentSequence: true,
      host: {
        select: {
          id: true,
          name: true,
        },
      },
      players: {
        where: { userId: session.user.id },
        select: { id: true },
      },
    },
  });

  if (!game) {
    notFound();
  }

  // Access control - user must be host or a player in the game
  const isHost = game.host.id === session.user.id;
  const isPlayer = game.players.length > 0;
  if (!isHost && !isPlayer) {
    notFound(); // Return 404 instead of exposing game exists
  }

  // Fetch all claims for this game with player info
  const claims = await prisma.claim.findMany({
    where: { gameId },
    include: {
      player: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [{ pattern: "asc" }, { rank: "asc" }],
  });

  // Group claims by pattern
  const claimsByPattern: Record<
    string,
    Array<{
      playerId: string;
      playerName: string;
      rank: number;
      points: number;
      claimedAt: string;
    }>
  > = {};

  for (const claim of claims) {
    if (!claimsByPattern[claim.pattern]) {
      claimsByPattern[claim.pattern] = [];
    }
    claimsByPattern[claim.pattern].push({
      playerId: claim.playerId,
      playerName: claim.player.name,
      rank: claim.rank,
      points: claim.points,
      claimedAt: claim.claimedAt.toISOString(),
    });
  }

  // Calculate player scores
  const playerScores: Record<
    string,
    { name: string; totalPoints: number }
  > = {};
  for (const claim of claims) {
    if (!playerScores[claim.playerId]) {
      playerScores[claim.playerId] = {
        name: claim.player.name,
        totalPoints: 0,
      };
    }
    playerScores[claim.playerId].totalPoints += claim.points;
  }

  // Sort players by total points
  const sortedPlayers = Object.entries(playerScores)
    .map(([playerId, data]) => ({
      playerId,
      name: data.name,
      totalPoints: data.totalPoints,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // Check if Full House was claimed
  const fullHouseClaim = claims.find(
    (c) => c.pattern === "FULL_HOUSE" && c.rank === 1
  );

  return (
    <ResultsPageClient
      game={{
        id: game.id,
        title: game.title,
        status: game.status,
        completedAt: game.completedAt?.toISOString() ?? null,
        numbersCalledCount: game.currentSequence,
        hostId: game.host.id,
        hostName: game.host.name ?? "Unknown",
      }}
      claimsByPattern={claimsByPattern}
      sortedPlayers={sortedPlayers}
      fullHouseWinner={
        fullHouseClaim
          ? {
              playerId: fullHouseClaim.playerId,
              playerName: fullHouseClaim.player.name,
              points: fullHouseClaim.points,
            }
          : null
      }
    />
  );
}
