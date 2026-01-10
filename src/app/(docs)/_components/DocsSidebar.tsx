"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScrollSpy } from "../_hooks/useScrollSpy";

interface NavItem {
  title: string;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const docsNavigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [{ title: "Introduction", href: "/docs" }],
  },
  {
    title: "Host Guide",
    items: [
      { title: "Overview", href: "/docs/host" },
      {
        title: "Creating a Game",
        href: "/docs/host#creating-a-game",
      },
      {
        title: "Customizing Options",
        href: "/docs/host#customization",
      },
      { title: "Sharing Your Game", href: "/docs/host#sharing" },
      { title: "Managing Gameplay", href: "/docs/host#managing" },
      { title: "Game Completion", href: "/docs/host#completion" },
    ],
  },
  {
    title: "Player Guide",
    items: [
      { title: "Overview", href: "/docs/player" },
      { title: "Joining a Game", href: "/docs/player#joining" },
      {
        title: "Understanding Your Ticket",
        href: "/docs/player#ticket",
      },
      { title: "Prize Patterns", href: "/docs/player#patterns" },
      { title: "Marking Numbers", href: "/docs/player#marking" },
      { title: "Making Claims", href: "/docs/player#claims" },
      { title: "Tips for Winning", href: "/docs/player#tips" },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  // Extract all section IDs for scroll spy
  const sectionIds = docsNavigation
    .flatMap((section) => section.items)
    .filter((item) => item.href.includes("#"))
    .map((item) => item.href.split("#")[1]);

  const activeSection = useScrollSpy(sectionIds);

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <nav className="space-y-6 pr-4">
        <Link
          href="/docs"
          className="flex items-center gap-2 font-bold text-lg text-slate-900"
        >
          📚 Tambola Docs
        </Link>

        {docsNavigation.map((section) => (
          <div key={section.title}>
            <h4 className="mb-2 text-sm font-semibold text-slate-900">
              {section.title}
            </h4>
            <ul className="space-y-1">
              {section.items.map((item) => {
                // Determine if this item is active
                const isHashLink = item.href.includes("#");
                const basePath = item.href.split("#")[0];
                const hash = isHashLink
                  ? item.href.split("#")[1]
                  : null;

                let isActive = false;
                if (item.href === "/docs") {
                  // Exact match for docs index
                  isActive = pathname === "/docs";
                } else if (isHashLink && pathname === basePath) {
                  // For hash links on current page, use scroll spy
                  isActive = activeSection === hash;
                } else if (!isHashLink) {
                  // For page links without hash, check exact pathname match
                  isActive = pathname === basePath;
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="border-t pt-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back
          </Link>
        </div>
      </nav>
    </ScrollArea>
  );
}

export { docsNavigation };
