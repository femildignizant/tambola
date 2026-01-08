"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Copy, Check, Clock, Users } from "lucide-react";

interface Pattern {
  pattern: string;
  enabled: boolean;
  points1st: number;
  points2nd: number | null;
  points3rd: number | null;
}

interface GameInfoProps {
  title: string;
  hostName: string;
  gameCode: string;
  numberInterval: number;
  minPlayers: number;
  maxPlayers: number;
  patterns: Pattern[];
  gameId: string;
}

export function GameInfo({
  title,
  hostName,
  gameCode,
  numberInterval,
  minPlayers,
  maxPlayers,
  patterns,
  gameId,
}: GameInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      const link = `${window.location.origin}/game/${gameId}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatPatternName = (pattern: string) => {
    return pattern
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const enabledPatterns = patterns.filter((p) => p.enabled);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Game Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game Title */}
        <div>
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Hosted by {hostName}
          </p>
        </div>

        {/* Game Code */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Game Code</p>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="text-lg font-mono px-4 py-2"
            >
              {gameCode}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </div>

        {/* Game Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Number Interval:
            </span>
            <Badge variant="secondary">{numberInterval}s</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Players:</span>
            <Badge variant="secondary">
              {minPlayers}-{maxPlayers}
            </Badge>
          </div>
        </div>

        {/* Prize Patterns */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Prize Patterns</p>
          <div className="space-y-2">
            {enabledPatterns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No patterns configured
              </p>
            ) : (
              enabledPatterns.map((pattern) => (
                <div
                  key={pattern.pattern}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <span className="text-sm font-medium">
                    {formatPatternName(pattern.pattern)}
                  </span>
                  <div className="flex gap-2">
                    <Badge variant="default">
                      {pattern.points1st} pts
                    </Badge>
                    {pattern.points2nd && (
                      <Badge variant="secondary">
                        {pattern.points2nd} pts
                      </Badge>
                    )}
                    {pattern.points3rd && (
                      <Badge variant="secondary">
                        {pattern.points3rd} pts
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
