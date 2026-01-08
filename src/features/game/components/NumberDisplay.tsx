import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberDisplayProps {
  currentNumber: number | null;
  className?: string;
}

export function NumberDisplay({ currentNumber, className }: NumberDisplayProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (currentNumber !== null) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [currentNumber]);

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {currentNumber !== null ? (
        <div
          key={currentNumber}
          className={cn(
            "text-9xl font-bold text-primary transition-all duration-300",
            animate ? "scale-125" : "scale-100"
          )}
          aria-label={`Current number is ${currentNumber}`}
        >
          {currentNumber}
        </div>
      ) : (
        <div className="text-2xl text-muted-foreground animate-pulse">
          Waiting...
        </div>
      )}
    </div>
  );
}
