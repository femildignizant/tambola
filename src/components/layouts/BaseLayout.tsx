import type { ReactNode } from "react";
import { AppHeader } from "@/components/navigation/AppHeader";
import { cn } from "@/lib/utils";

interface BaseLayoutProps {
  children: ReactNode;
  headerTitle?: string;
  showHeader?: boolean;
  showUserMenu?: boolean;
  headerChildren?: ReactNode;
  className?: string;
}

/**
 * BaseLayout - Root layout wrapper with consistent header/footer structure
 *
 * Provides the foundational layout structure for all pages.
 * Includes optional AppHeader and wraps page content.
 */
export function BaseLayout({
  children,
  headerTitle,
  showHeader = true,
  showUserMenu = true,
  headerChildren,
  className,
}: BaseLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {showHeader && (
        <AppHeader title={headerTitle} showUserMenu={showUserMenu}>
          {headerChildren}
        </AppHeader>
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}
