import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface NumberHistoryProps {
  calledNumbers: number[];
  className?: string;
}

export function NumberHistory({ calledNumbers, className }: NumberHistoryProps) {
  // Get last 10 numbers, reversed so most recent is first
  const history = useMemo(() => calledNumbers.slice(-10).reverse(), [calledNumbers]);

  return (
    <div className={cn("w-full", className)}>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        Last 10 Numbers
      </h3>
      <div className="flex flex-wrap gap-2">
        {history.length > 0 ? (
          history.map((num, index) => (
            <div
              key={`${num}-${index}`}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border",
                index === 0
                  ? "bg-primary text-primary-foreground border-primary scale-110 shadow-md"
                  : "bg-background text-foreground border-border"
              )}
              aria-label={index === 0 ? `Most recent number ${num}` : `Number ${num}`}
            >
              {num}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No numbers called yet
          </p>
        )}
      </div>
    </div>
  );
}
