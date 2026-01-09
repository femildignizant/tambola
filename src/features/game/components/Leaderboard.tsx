"use client";

import { useGameStore } from "../game-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal } from "lucide-react";

export function Leaderboard() {
  const { claimedPatterns } = useGameStore();

  // Sort claimed patterns by rank (1st, 2nd, 3rd) and then timestamp
  const sortedClaims = [...claimedPatterns].sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return (
      new Date(a.claimedAt).getTime() -
      new Date(b.claimedAt).getTime()
    );
  });

  return (
    <Card className="h-full max-h-[400px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden pt-0">
        <ScrollArea className="h-full pr-4">
          {sortedClaims.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
              <Trophy className="h-8 w-8 mb-2 opacity-20" />
              <p>No claims yet.</p>
              <p>Be the first to win!</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {sortedClaims.map((claim, index) => {
                const claimId = `${claim.playerId}-${claim.pattern}`;

                return (
                  <div
                    key={claimId}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-secondary transition-all duration-300"
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
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
