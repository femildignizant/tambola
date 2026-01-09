import type { ReactNode } from "react";
import { BaseLayout } from "./BaseLayout";
import { PageContent } from "./PageContent";
import { BackButton } from "@/components/navigation/BackButton";

interface HostLayoutProps {
  children: ReactNode;
  showBackToDashboard?: boolean;
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
 * HostLayout - Layout for host pages with dashboard navigation
 *
 * Extends BaseLayout with host-specific features like "Back to Dashboard" navigation.
 * Used for dashboard, game creation, and game configuration pages.
 */
export function HostLayout({
  children,
  showBackToDashboard = false,
  headerChildren,
  maxWidth = "5xl",
  className,
}: HostLayoutProps) {
  return (
    <BaseLayout
      headerChildren={
        <>
          {showBackToDashboard && (
            <BackButton href="/dashboard" label="Dashboard" />
          )}
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
