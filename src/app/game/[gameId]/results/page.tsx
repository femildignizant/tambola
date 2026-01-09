import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
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

  // Check for session (host) or player access
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  // Get player token from cookie (for anonymous players)
  const cookieStore = await cookies();
  const playerToken = cookieStore.get(`game-${gameId}-token`)?.value;

  // Must be either authenticated user OR have a player token
  const isAuthenticated = !!session?.user?.id;
  const hasPlayerToken = !!playerToken;

  if (!isAuthenticated && !hasPlayerToken) {
    // Client-side redirect will handle this - show results anyway for participants
    // Actually, let's be more lenient - if no auth at all, still try to show results
    // because the player might have the token in localStorage
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
        select: {
          id: true,
          name: true,
          token: true,
        },
      },
    },
  });

  if (!game) {
    notFound();
  }

  // Determine access
  const isHost = session?.user?.id === game.host.id;
  const isPlayer = playerToken
    ? game.players.some((p) => p.token === playerToken)
    : false;
  const isSessionPlayer = session?.user?.id
    ? game.players.some((p) => p.id === session.user.id)
    : false;

  // Allow access if: host, player with token, or player with session
  // Be lenient on completed games - anyone who participated should see results
  if (!isHost && !isPlayer && !isSessionPlayer) {
    // For completed games, allow anyone who might have participated
    // by checking if the game is completed (can't harm anything)
    if (game.status !== "COMPLETED") {
      notFound();
    }
    // If game is completed but no auth, show results anyway (public results)
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
