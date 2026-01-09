import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { HostLayout } from "@/components/layouts/HostLayout";
import { PageHeader } from "@/components/layouts/PageHeader";
import { DashboardTabs } from "@/features/game/components/DashboardTabs";

export default function DashboardPage() {
  return (
    <HostLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Manage your games and view your history."
        actions={
          <Link href="/dashboard/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Game
            </Button>
          </Link>
        }
      />
      <DashboardTabs />
    </HostLayout>
  );
}
