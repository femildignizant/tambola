import { cn } from "@/lib/utils";

type PatternType =
  | "TOP_ROW"
  | "MIDDLE_ROW"
  | "BOTTOM_ROW"
  | "EARLY_FIVE"
  | "FOUR_CORNERS"
  | "FULL_HOUSE";

interface PatternVisualProps {
  pattern: PatternType;
  title: string;
  description: string;
}

// Define which cells are highlighted for each pattern
// A Tambola ticket has 3 rows × 9 columns, with each row having exactly 5 numbers
// We show a simplified view where 1 = valid number position, 0 = empty cell
// For visualization, highlighted cells show the pattern requirement
const PATTERN_CELLS: Record<PatternType, number[][]> = {
  TOP_ROW: [
    [1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  MIDDLE_ROW: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  BOTTOM_ROW: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0, 0],
  ],
  EARLY_FIVE: [
    [1, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  FOUR_CORNERS: [
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
  ],
  FULL_HOUSE: [
    [1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1],
  ],
};

// Representative numbers for a ticket layout (for visual appeal)
const TICKET_NUMBERS: (number | null)[][] = [
  [3, 12, null, 25, 41, null, 63, null, 84],
  [null, 18, 22, null, 47, 55, null, 71, null],
  [7, null, 29, 36, null, null, 68, 77, 89],
];

export function PatternVisual({
  pattern,
  title,
  description,
}: PatternVisualProps) {
  const cells = PATTERN_CELLS[pattern];

  return (
    <div className="not-prose border rounded-lg p-4 bg-slate-50">
      <h4 className="font-semibold text-lg text-slate-900 mb-1">
        {title}
      </h4>
      <p className="text-sm text-slate-600 mb-4">{description}</p>

      <div className="grid grid-rows-3 gap-1 max-w-sm mx-auto">
        {cells.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-9 gap-1">
            {row.map((cell, colIndex) => {
              const number = TICKET_NUMBERS[rowIndex][colIndex];
              const isHighlighted = cell === 1;
              const hasNumber = number !== null;

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    "aspect-square rounded-sm border text-xs flex items-center justify-center font-medium",
                    isHighlighted && hasNumber
                      ? "bg-primary text-primary-foreground border-primary"
                      : hasNumber
                      ? "bg-white text-slate-700 border-slate-300"
                      : "bg-slate-100 border-slate-200"
                  )}
                >
                  {hasNumber ? number : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span>Required</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-white border border-slate-300" />
          <span>Number</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200" />
          <span>Empty</span>
        </div>
      </div>
    </div>
  );
}
