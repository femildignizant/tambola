"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { docsNavigation } from "./DocsSidebar";
import { useScrollSpy } from "../_hooks/useScrollSpy";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Extract all section IDs for scroll spy
  const sectionIds = docsNavigation
    .flatMap((section) => section.items)
    .filter((item) => item.href.includes("#"))
    .map((item) => item.href.split("#")[1]);

  const activeSection = useScrollSpy(sectionIds);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="text-left">
            <Link
              href="/docs"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2"
            >
              📚 Tambola Docs
            </Link>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="space-y-6 p-4">
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
                      isActive = pathname === "/docs";
                    } else if (isHashLink && pathname === basePath) {
                      isActive = activeSection === hash;
                    } else if (!isHashLink) {
                      isActive = pathname === basePath;
                    }

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
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
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                ← Back
              </Link>
            </div>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
