import type { Metadata } from "next";
import { DocsSidebar } from "./_components/DocsSidebar";
import Link from "next/link";
import { MobileSidebar } from "./_components/MobileSidebar";

export const metadata: Metadata = {
  title: {
    template: "%s | Tambola Docs",
    default: "Documentation | Tambola",
  },
  description:
    "Learn how to host and play Tambola games with our comprehensive guides.",
  openGraph: {
    title: "Tambola Documentation",
    description:
      "Comprehensive guides for hosting and playing online Tambola games.",
    type: "website",
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header with Menu Button */}
      <header className="sticky top-0 z-40 lg:hidden border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container flex h-14 items-center px-4">
          <MobileSidebar />
          <Link
            href="/docs"
            className="ml-4 font-semibold text-slate-900"
          >
            Tambola Docs
          </Link>
        </div>
      </header>

      <div className="container mx-auto flex gap-8 py-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-8">
            <DocsSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 max-w-4xl">{children}</main>
      </div>
    </div>
  );
}
