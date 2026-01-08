import { LogoutButton } from "@/components/LogoutButton";
import { GameList } from "@/features/game/components/GameList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function DashboardPage() {
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

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Your Games
            </h2>
            <p className="text-muted-foreground">
              Manage your game sessions here.
            </p>
          </div>
          <Link href="/dashboard/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Game
            </Button>
          </Link>
        </div>

        <GameList />
      </main>
    </div>
  );
}
