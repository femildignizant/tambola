"use client";

import { useMemo } from "react";
import { useGameStore } from "../game-store";
import type { ClaimPattern } from "../types/claims";
import {
  CLAIM_PATTERN_TO_DB_PATTERN,
  PATTERN_DISPLAY_INFO,
} from "../types/claims";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Check, CircleDot, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatternStatusListProps {
  className?: string;
}

interface PatternConfig {
  pattern: string;
  enabled: boolean;
  points1st: number;
  points2nd: number | null;
  points3rd: number | null;
}

type PatternStatus = "AVAILABLE" | "PARTIAL" | "CLOSED";

export function PatternStatusList({
  className,
}: PatternStatusListProps) {
  const { game, claimedPatterns } = useGameStore();

  // Extract patterns for stable dependency reference
  const patterns = game?.patterns;

  // Get enabled patterns with their status
  const patternStatuses = useMemo(() => {
    if (!patterns) return [];

    // Filter enabled patterns and calculate status
    return patterns
      .filter((p: PatternConfig) => p.enabled)
      .map((patternConfig: PatternConfig) => {
        const dbPattern = patternConfig.pattern;

        // Find corresponding ClaimPattern for display info
        const claimPattern = Object.entries(
          CLAIM_PATTERN_TO_DB_PATTERN
        ).find(([, db]) => db === dbPattern)?.[0] as
          | ClaimPattern
          | undefined;

        // Get claims for this pattern
        const patternClaims = claimedPatterns.filter(
          (c) => c.pattern === dbPattern || c.pattern === claimPattern
        );

        // Calculate max winners
        const maxWinners = patternConfig.points3rd
          ? 3
          : patternConfig.points2nd
          ? 2
          : 1;

        const claimCount = patternClaims.length;

        // Calculate status
        let status: PatternStatus = "AVAILABLE";
        if (claimCount >= maxWinners) {
          status = "CLOSED";
        } else if (claimCount > 0) {
          status = "PARTIAL";
        }

        // Get display info
        const displayInfo = claimPattern
          ? PATTERN_DISPLAY_INFO[claimPattern]
          : {
              name: dbPattern.replace(/_/g, " "),
              description: "",
            };

        // Get points for display
        const points = [
          patternConfig.points1st,
          patternConfig.points2nd,
          patternConfig.points3rd,
        ].filter((p) => p !== null) as number[];

        return {
          pattern: dbPattern,
          claimPattern,
          displayInfo,
          status,
          claimCount,
          maxWinners,
          points,
          claims: patternClaims
            .sort((a, b) => a.rank - b.rank)
            .map((c) => ({
              playerName: c.playerName,
              rank: c.rank,
              points: c.points,
            })),
        };
      });
  }, [patterns, claimedPatterns]);

  if (patternStatuses.length === 0) {
    return null;
  }

  const getStatusBadge = (
    status: PatternStatus,
    claimCount: number,
    maxWinners: number
  ) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-300"
          >
            <CircleDot className="h-3 w-3 mr-1" />
            Available
          </Badge>
        );
      case "PARTIAL":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-300"
          >
            <Medal className="h-3 w-3 mr-1" />
            {claimCount}/{maxWinners} Claimed
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-600 border-gray-300"
          >
            <Check className="h-3 w-3 mr-1" />
            Closed
          </Badge>
        );
    }
  };

  const getCardClasses = (status: PatternStatus) => {
    switch (status) {
      case "AVAILABLE":
        return "border-green-200 bg-green-50/30";
      case "PARTIAL":
        return "border-yellow-200 bg-yellow-50/30";
      case "CLOSED":
        return "border-gray-200 bg-gray-50/50 opacity-75";
    }
  };

  return (
    <Card
      className={cn("h-full max-h-[400px] flex flex-col", className)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-500" />
          Prize Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden pt-0">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-3 pt-2">
            {patternStatuses.map((pattern) => (
              <div
                key={pattern.pattern}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-300",
                  getCardClasses(pattern.status)
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={cn(
                          "font-medium text-sm",
                          pattern.status === "CLOSED" &&
                            "line-through"
                        )}
                      >
                        {pattern.displayInfo.name}
                      </p>
                      {getStatusBadge(
                        pattern.status,
                        pattern.claimCount,
                        pattern.maxWinners
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pattern.displayInfo.description}
                    </p>

                    {/* Show points */}
                    <div className="flex items-center gap-2 mt-2">
                      {pattern.points.map((pts, idx) => (
                        <span
                          key={`${pattern.pattern}-${idx}`}
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            idx === 0
                              ? "bg-yellow-100 text-yellow-800"
                              : idx === 1
                              ? "bg-gray-100 text-gray-700"
                              : "bg-amber-50 text-amber-700"
                          )}
                        >
                          {idx === 0
                            ? "1st"
                            : idx === 1
                            ? "2nd"
                            : "3rd"}
                          : {pts}pts
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Show winners if any */}
                {pattern.claims.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                    <p className="text-xs text-muted-foreground mb-1">
                      Winners:
                    </p>
                    <div className="space-y-1">
                      {pattern.claims.map((claim) => (
                        <div
                          key={`${pattern.pattern}-${claim.rank}`}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="font-medium">
                            #{claim.rank} {claim.playerName}
                          </span>
                          <span className="text-primary font-semibold">
                            +{claim.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
