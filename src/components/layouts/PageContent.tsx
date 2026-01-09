import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContentProps {
  children: ReactNode;
  className?: string;
  maxWidth?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "full";
}

/**
 * PageContent - Content wrapper with consistent max-width and padding
 *
 * Provides consistent container styling across all pages with configurable max-width.
 * Default max-width is 5xl (64rem) to match existing dashboard pattern.
 */
export function PageContent({
  children,
  className,
  maxWidth = "5xl",
}: PageContentProps) {
  const maxWidthClass =
    maxWidth === "full" ? "max-w-full" : `max-w-${maxWidth}`;

  return (
    <div
      className={cn(
        "container mx-auto px-4 py-8",
        maxWidthClass,
        className
      )}
    >
      {children}
    </div>
  );
}
