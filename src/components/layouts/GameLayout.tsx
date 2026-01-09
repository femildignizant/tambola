import type { ReactNode } from "react";
import { BaseLayout } from "./BaseLayout";
import { PageContent } from "./PageContent";
import { GameCodeDisplay } from "@/components/navigation/GameCodeDisplay";
import { LeaveGameButton } from "@/components/navigation/LeaveGameButton";

interface GameLayoutProps {
  children: ReactNode;
  gameId: string;
  gameCode: string;
  showLeaveButton?: boolean;
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
 * GameLayout - Layout for active game pages (lobby, play, results)
 *
 * Extends BaseLayout with game-specific features like game code display and leave button.
 * Uses wider max-width by default to accommodate game grid.
 */
export function GameLayout({
  children,
  gameId,
  gameCode,
  showLeaveButton = true,
  headerChildren,
  maxWidth = "7xl",
  className,
}: GameLayoutProps) {
  return (
    <BaseLayout
      headerChildren={
        <>
          <GameCodeDisplay gameCode={gameCode} />
          {headerChildren}
          {showLeaveButton && <LeaveGameButton gameId={gameId} />}
        </>
      }
    >
      <PageContent maxWidth={maxWidth} className={className}>
        {children}
      </PageContent>
    </BaseLayout>
  );
}
