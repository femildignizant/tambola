import { cn } from "@/lib/utils";

import { useGameStore } from "@/features/game/game-store";

const safelyParseGrid = (gridString: string) => {
  try {
    return JSON.parse(gridString);
  } catch {
    return [];
  }
};

interface TicketProps {
  grid: (number | null)[][] | string; // Can be string (JSON) or array
}

export function Ticket({ grid }: TicketProps) {
  const { markedNumbers, toggleMark } = useGameStore();

  // Parse grid if it's a string
  const gridData =
    typeof grid === "string" ? safelyParseGrid(grid) : grid;

  // Ensure grid is 3x9 array
  const parsedGrid: (number | null)[][] = Array.isArray(gridData)
    ? gridData
    : [];

  const handleCellClick = (number: number | null) => {
    if (number !== null && number !== 0) {
      toggleMark(number);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-card rounded-xl shadow-lg border border-border">
      <div className="grid grid-rows-3 gap-1 p-2 bg-muted/30 rounded-lg">
        {parsedGrid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-9 gap-1">
            {row.map((cell, colIndex) => {
              const number = cell === 0 ? null : cell;
              const isMarked =
                number !== null && markedNumbers.includes(number);

              return (
                <button
                  type="button"
                  key={`${rowIndex}-${colIndex}`}
                  aria-label={
                    number !== null
                      ? `Number ${number}, ${
                          isMarked ? "marked" : "unmarked"
                        }`
                      : "Empty cell"
                  }
                  aria-pressed={isMarked}
                  onClick={() => handleCellClick(number)}
                  className={cn(
                    "aspect-square flex items-center justify-center text-sm sm:text-base font-semibold rounded transition-all duration-200 select-none",
                    number === null
                      ? "bg-muted/50 text-muted-foreground/30 pointer-events-none" // Empty cell style
                      : "bg-background border-2 border-primary/20 hover:border-primary/50 cursor-pointer shadow-sm",
                    isMarked &&
                      "bg-primary text-primary-foreground border-primary shadow-inner scale-95 transform"
                  )}
                  disabled={number === null}
                >
                  {number}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
