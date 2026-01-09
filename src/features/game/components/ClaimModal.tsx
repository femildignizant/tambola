"use client";

import { useState, useCallback } from "react";
import { useGameStore } from "../game-store";
import {
  ClaimPattern,
  CLAIM_PATTERN_TO_DB_PATTERN,
  PATTERN_DISPLAY_INFO,
} from "../types/claims";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Check, X } from "lucide-react";

interface ClaimModalProps {
  gameId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ClaimModal({
  gameId,
  isOpen,
  onClose,
}: ClaimModalProps) {
  const [selectedPattern, setSelectedPattern] =
    useState<ClaimPattern | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const {
    currentPlayer,
    game,
    claimedPatterns,
    setIsClaiming,
    setClaimError,
    addClaimedPattern,
  } = useGameStore();

  // Get enabled patterns from game config
  const enabledPatterns =
    game?.patterns.filter((p) => p.enabled).map((p) => p.pattern) ??
    [];

  // Check if a pattern is already fully claimed
  const getPatternStatus = useCallback(
    (pattern: ClaimPattern) => {
      const dbPattern = CLAIM_PATTERN_TO_DB_PATTERN[pattern];
      const patternClaims = claimedPatterns.filter(
        (c) => c.pattern === pattern || c.pattern === dbPattern
      );
      const gamePattern = game?.patterns.find(
        (p) => p.pattern === dbPattern
      );
      // If pattern not configured in game, it's not available (but NOT "fully claimed")
      if (!gamePattern)
        return {
          claimed: false,
          maxReached: false,
          count: 0,
          unavailable: true,
        };

      const maxRank = gamePattern.points3rd
        ? 3
        : gamePattern.points2nd
        ? 2
        : 1;
      const isMine = patternClaims.some(
        (c) => c.playerId === currentPlayer?.id
      );

      return {
        claimed: patternClaims.length > 0,
        maxReached: patternClaims.length >= maxRank,
        count: patternClaims.length,
        maxRank,
        isMine,
      };
    },
    [claimedPatterns, game?.patterns, currentPlayer?.id]
  );

  const handleSubmit = async () => {
    if (!selectedPattern || !currentPlayer) return;

    setIsSubmitting(true);
    setIsClaiming(true);
    setResult(null);

    try {
      const response = await fetch(`/api/games/${gameId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pattern: selectedPattern,
          playerId: currentPlayer.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          success: false,
          message: data.reason || data.error || "Claim failed",
        });
        setClaimError(data.error);
        return;
      }

      // Success
      addClaimedPattern({
        pattern: selectedPattern,
        rank: data.data.claim.rank,
        points: data.data.claim.points,
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        claimedAt: new Date().toISOString(),
      });

      setResult({
        success: true,
        message: `Congratulations! You claimed ${PATTERN_DISPLAY_INFO[selectedPattern].name} (Rank #${data.data.claim.rank}) for ${data.data.claim.points} points!`,
      });
    } catch {
      setResult({
        success: false,
        message: "Network error. Please try again.",
      });
      setClaimError("Network error");
    } finally {
      setIsSubmitting(false);
      setIsClaiming(false);
    }
  };

  const handleClose = () => {
    setSelectedPattern(null);
    setResult(null);
    onClose();
  };

  // Use centralized mapping
  const mapToDbPattern = (pattern: ClaimPattern): string =>
    CLAIM_PATTERN_TO_DB_PATTERN[pattern];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Claim a Prize
          </DialogTitle>
          <DialogDescription>
            Select the pattern you want to claim. Make sure all
            required numbers are called!
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div
            className={`p-4 rounded-lg ${
              result.success
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {result.success ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
              <p className="font-medium">{result.message}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-2 py-4">
            {Object.values(ClaimPattern).map((pattern) => {
              const dbPattern = mapToDbPattern(pattern);
              const isEnabled = enabledPatterns.includes(dbPattern);
              const status = getPatternStatus(pattern);

              if (!isEnabled) return null;

              return (
                <button
                  type="button"
                  key={pattern}
                  onClick={() =>
                    !status.maxReached && setSelectedPattern(pattern)
                  }
                  disabled={status.maxReached || isSubmitting}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedPattern === pattern
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : status.maxReached
                      ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                      : status.isMine
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {PATTERN_DISPLAY_INFO[pattern].name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {PATTERN_DISPLAY_INFO[pattern].description}
                      </p>
                    </div>
                    {status.isMine && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Claimed by you!
                      </span>
                    )}
                    {status.maxReached && !status.isMine && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Fully claimed
                      </span>
                    )}
                    {!status.maxReached && status.count > 0 && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {status.count}/{status.maxRank} claimed
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <Button onClick={handleClose}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedPattern || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Claim Prize"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
