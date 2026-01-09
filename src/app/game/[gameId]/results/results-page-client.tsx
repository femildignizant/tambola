"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal, Home, Crown, Users } from "lucide-react";

interface ResultsPageClientProps {
  game: {
    id: string;
    title: string;
    status: string;
    completedAt: string | null;
    numbersCalledCount: number;
    hostId: string;
    hostName: string;
  };
  claimsByPattern: Record<
    string,
    Array<{
      playerId: string;
      playerName: string;
      rank: number;
      points: number;
      claimedAt: string;
    }>
  >;
  sortedPlayers: Array<{
    playerId: string;
    name: string;
    totalPoints: number;
  }>;
  fullHouseWinner: {
    playerId: string;
    playerName: string;
    points: number;
  } | null;
}

export function ResultsPageClient({
  game,
  claimsByPattern,
  sortedPlayers,
  fullHouseWinner,
}: ResultsPageClientProps) {
  const isCompleted = game.status === "COMPLETED";
  const wasFullHouse = fullHouseWinner !== null;

  // Convert all claims to flat list for leaderboard
  const allClaims = Object.entries(claimsByPattern).flatMap(
    ([pattern, claims]) =>
      claims.map((claim) => ({
        ...claim,
        pattern,
      }))
  );

  // Sort by points descending, then by claim time ascending
  const sortedClaims = allClaims.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return (
      new Date(a.claimedAt).getTime() -
      new Date(b.claimedAt).getTime()
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {game.title}
        </h1>
        <p className="text-muted-foreground">
          {isCompleted ? "Game Completed" : "Game Results"}
        </p>
      </div>

      {/* Game End Reason Banner */}
      {isCompleted && (
        <Card
          className={`${
            wasFullHouse
              ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30"
              : "bg-muted/50"
          }`}
        >
          <CardContent className="flex items-center justify-center gap-3 py-6">
            {wasFullHouse ? (
              <>
                <Crown className="h-10 w-10 text-yellow-500" />
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    🎉 {fullHouseWinner.playerName} Wins!
                  </p>
                  <p className="text-muted-foreground">
                    Full House claimed with {fullHouseWinner.points}{" "}
                    points
                  </p>
                </div>
                <Crown className="h-10 w-10 text-yellow-500" />
              </>
            ) : (
              <div className="text-center">
                <p className="text-xl font-semibold">Game Ended</p>
                <p className="text-muted-foreground">
                  {game.numbersCalledCount === 90
                    ? "All 90 numbers were called"
                    : "Game was ended by host"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Player Standings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Player Standings
            </CardTitle>
            <CardDescription>
              Final scores by total points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {sortedPlayers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                  <p>No winners in this game.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedPlayers.map((player, index) => (
                    <div
                      key={player.playerId}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30"
                          : index === 1
                          ? "bg-gradient-to-r from-slate-400/20 to-slate-300/20 border border-slate-400/30"
                          : index === 2
                          ? "bg-gradient-to-r from-orange-700/20 to-orange-600/20 border border-orange-600/30"
                          : "bg-secondary/50 border border-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                            index === 0
                              ? "bg-yellow-500 text-yellow-950"
                              : index === 1
                              ? "bg-slate-400 text-slate-950"
                              : index === 2
                              ? "bg-orange-600 text-orange-950"
                              : "bg-background border"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {player.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {player.totalPoints}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* All Claims */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              All Claims
            </CardTitle>
            <CardDescription>
              Patterns claimed during the game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {sortedClaims.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                  <Trophy className="h-8 w-8 mb-2 opacity-20" />
                  <p>No claims were made.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedClaims.map((claim, index) => (
                    <div
                      key={`${claim.playerId}-${claim.pattern}-${claim.rank}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-secondary"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {claim.playerName}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {claim.pattern
                              .replace(/_/g, " ")
                              .toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          +{claim.points}
                        </p>
                        <div className="flex items-center justify-end gap-1 text-xs text-yellow-600">
                          <Medal className="h-3 w-3" />
                          <span>Rank #{claim.rank}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/dashboard">
            <Home className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/game/join">
            <Trophy className="h-5 w-5 mr-2" />
            Join Another Game
          </Link>
        </Button>
      </div>

      {/* Game Stats */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">
                {game.numbersCalledCount}
              </p>
              <p className="text-xs text-muted-foreground">
                Numbers Called
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {sortedPlayers.length}
              </p>
              <p className="text-xs text-muted-foreground">Winners</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {sortedClaims.length}
              </p>
              <p className="text-xs text-muted-foreground">
                Total Claims
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {sortedPlayers.reduce(
                  (sum, p) => sum + p.totalPoints,
                  0
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Total Points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Host info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Game hosted by {game.hostName ?? "Unknown"}</p>
        {game.completedAt && (
          <p>
            Completed at {new Date(game.completedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
