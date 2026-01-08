import { LogoutButton } from "@/components/LogoutButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between mx-auto px-4 max-w-5xl">
          <h1 className="text-xl font-bold">Tambola Host</h1>
          <div className="flex items-center gap-4">
            <LogoutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
