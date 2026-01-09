import { GameList } from "@/features/game/components/GameList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { HostLayout } from "@/components/layouts/HostLayout";
import { PageHeader } from "@/components/layouts/PageHeader";

export default function DashboardPage() {
  return (
    <HostLayout>
      <PageHeader
        title="Your Games"
        subtitle="Manage your game sessions here."
        actions={
          <Link href="/dashboard/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Game
            </Button>
          </Link>
        }
      />
      <GameList />
    </HostLayout>
  );
}
