"use client";

import { cn } from "@/lib/utils";

interface AllNumbersGridProps {
  calledNumbers: number[];
  className?: string;
}

/**
 * Displays all 90 Tambola numbers in a grid, highlighting called numbers.
 * This is specifically for hosts to see the full game state at a glance.
 */
export function AllNumbersGrid({
  calledNumbers,
  className,
}: AllNumbersGridProps) {
  const calledSet = new Set(calledNumbers);

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => {
          const isCalled = calledSet.has(num);
          return (
            <div
              key={num}
              className={cn(
                "aspect-square flex items-center justify-center text-xs font-medium rounded border transition-all duration-300",
                isCalled
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted/30 text-muted-foreground border-border/50"
              )}
            >
              {num}
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground mt-2 text-center">
        {calledNumbers.length} of 90 numbers called
      </p>
    </div>
  );
}
