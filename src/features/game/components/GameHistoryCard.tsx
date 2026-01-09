"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, Crown } from "lucide-react";
import { Pattern } from "@/generated/prisma/client";

interface GameHistoryClaim {
  pattern: Pattern;
  rank: number;
  points: number;
}

interface GameHistoryCardProps {
  id: string;
  title: string;
  hostName: string;
  isHost: boolean;
  completedAt: string | null;
  playerCount: number;
  status: "won" | "participated" | "host-only";
  totalPoints: number;
  claims: GameHistoryClaim[];
}

// Map pattern enum to display name
const patternDisplayNames: Record<Pattern, string> = {
  FIRST_ROW: "First Row",
  SECOND_ROW: "Second Row",
  THIRD_ROW: "Third Row",
  EARLY_FIVE: "Early Five",
  FOUR_CORNERS: "Four Corners",
  FULL_HOUSE: "Full House",
};

// Helper for ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
const getOrdinalSuffix = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export function GameHistoryCard({
  title,
  hostName,
  isHost,
  completedAt,
  playerCount,
  status,
  totalPoints,
  claims,
}: Omit<GameHistoryCardProps, "id">) {
  // Status display logic
  const getStatusDisplay = () => {
    switch (status) {
      case "won":
        return {
          label: `Won (${totalPoints} pts)`,
          variant: "default" as const,
          icon: <Trophy className="h-3 w-3" />,
        };
      case "participated":
        return {
          label: "Participated",
          variant: "secondary" as const,
          icon: null,
        };
      case "host-only":
        return {
          label: "Host",
          variant: "outline" as const,
          icon: <Crown className="h-3 w-3" />,
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold truncate">
          {title}
        </CardTitle>
        <div className="flex gap-2">
          {isHost && status !== "host-only" && (
            <Badge variant="outline">
              <Crown className="h-3 w-3 mr-1" />
              Host
            </Badge>
          )}
          <Badge
            variant={statusDisplay.variant}
            className="flex items-center gap-1"
          >
            {statusDisplay.icon}
            {statusDisplay.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between py-1">
            <span className="flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Host:
            </span>
            <span>{hostName}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Completed:
            </span>
            <span>{formatDate(completedAt)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Players:
            </span>
            <span>{playerCount}</span>
          </div>
        </div>

        {/* Show claimed patterns if won */}
        {claims.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Patterns claimed:
            </p>
            <div className="flex flex-wrap gap-1">
              {claims.map((claim, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs"
                >
                  {patternDisplayNames[claim.pattern]}
                  {claim.rank > 1 &&
                    ` (${getOrdinalSuffix(claim.rank)})`}
                  <span className="ml-1 text-muted-foreground">
                    +{claim.points}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
