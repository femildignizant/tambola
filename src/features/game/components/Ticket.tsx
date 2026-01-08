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
      <div className="grid grid-rows-3 gap-1 bg-muted/50 p-2 rounded-lg">
        {parsedGrid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-9 gap-1">
            {row.map((cell, colIndex) => {
              const number = cell === 0 ? null : cell;
              const isMarked =
                number !== null && markedNumbers.includes(number);

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  role="button"
                  tabIndex={number !== null ? 0 : -1}
                  aria-label={
                    number !== null
                      ? `Number ${number}, ${
                          isMarked ? "marked" : "unmarked"
                        }`
                      : "Empty cell"
                  }
                  aria-pressed={isMarked}
                  onClick={() => handleCellClick(number)}
                  onKeyDown={(e) => {
                    if (
                      (e.key === "Enter" || e.key === " ") &&
                      number !== null
                    ) {
                      e.preventDefault();
                      handleCellClick(number);
                    }
                  }}
                  className={cn(
                    "aspect-[4/3] flex items-center justify-center text-lg sm:text-xl font-bold rounded-md transition-all duration-200 select-none",
                    number === null
                      ? "bg-transparent" // Empty cell
                      : "bg-background border-2 border-primary/20 hover:border-primary/50 cursor-pointer shadow-sm",
                    isMarked &&
                      "bg-primary text-primary-foreground border-primary shadow-inner scale-95 transform"
                  )}
                >
                  {number}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
