import type { ReactNode } from "react";
import { BaseLayout } from "./BaseLayout";
import { PageContent } from "./PageContent";
import { GameCodeDisplay } from "@/components/navigation/GameCodeDisplay";

interface PlayerLayoutProps {
  children: ReactNode;
  gameCode: string;
  headerChildren?: ReactNode;
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
  className?: string;
}

/**
 * PlayerLayout - Layout for player pages with game code display
 *
 * Extends BaseLayout with player-specific features like persistent game code display.
 * Used for lobby and game play pages from the player's perspective.
 */
export function PlayerLayout({
  children,
  gameCode,
  headerChildren,
  maxWidth = "5xl",
  className,
}: PlayerLayoutProps) {
  return (
    <BaseLayout
      headerChildren={
        <>
          <GameCodeDisplay gameCode={gameCode} />
          {headerChildren}
        </>
      }
    >
      <PageContent maxWidth={maxWidth} className={className}>
        {children}
      </PageContent>
    </BaseLayout>
  );
}
