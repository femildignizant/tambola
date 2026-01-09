"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GameCodeDisplayProps {
  gameCode: string;
  className?: string;
}

/**
 * GameCodeDisplay - Persistent game code display component with copy functionality
 *
 * Displays the game code prominently with a copy-to-clipboard button.
 * Used in player and game layouts to keep the game code visible.
 */
export function GameCodeDisplay({
  gameCode,
  className,
}: GameCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy game code:", error);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 bg-muted rounded border border-border",
        className
      )}
    >
      <span className="text-sm font-mono font-semibold">
        Code: {gameCode}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-6 w-6 p-0"
        title="Copy game code"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
