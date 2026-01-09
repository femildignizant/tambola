import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
  showUserMenu?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * AppHeader - Application header with logo and user menu
 *
 * Provides consistent header structure across all pages with optional logo,
 * title, and user menu (logout button).
 */
export function AppHeader({
  title = "Tambola",
  showLogo = true,
  showUserMenu = true,
  children,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn("border-b border-border bg-card", className)}
    >
      <div className="container max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showLogo && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2"
              >
                <h1 className="text-xl font-bold tracking-tight">
                  {title}
                </h1>
              </Link>
            )}
            {children}
          </div>

          {showUserMenu && (
            <div className="flex items-center gap-2">
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
