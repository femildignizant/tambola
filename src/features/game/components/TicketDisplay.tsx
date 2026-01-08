"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Ticket } from "lucide-react";

interface TicketDisplayProps {
  grid: number[][];
  playerName?: string;
}

export function TicketDisplay({
  grid,
  playerName,
}: TicketDisplayProps) {
  // Validate grid structure (3 rows × 9 columns)
  if (
    !grid ||
    grid.length !== 3 ||
    grid.some((row) => row.length !== 9)
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Your Ticket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Invalid ticket data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          {playerName ? `${playerName}'s Ticket` : "Your Ticket"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid grid-rows-3 gap-1 p-2 bg-muted/30 rounded-lg">
              {grid.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-9 gap-1"
                >
                  {row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        aspect-square flex items-center justify-center
                        text-sm font-semibold rounded
                        ${
                          cell === 0 || cell === null
                            ? "bg-muted/50 text-muted-foreground/30"
                            : "bg-background border-2 border-primary/20 hover:border-primary/40 transition-colors"
                        }
                      `}
                    >
                      {cell !== 0 && cell !== null ? cell : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column labels for reference */}
        <div className="mt-2 text-xs text-muted-foreground text-center">
          <p>Tambola Ticket - 3 rows × 9 columns</p>
        </div>
      </CardContent>
    </Card>
  );
}
