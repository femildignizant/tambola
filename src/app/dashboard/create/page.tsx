import { CreateGameForm } from "@/features/game/components/CreateGameForm";
import { HostLayout } from "@/components/layouts/HostLayout";
import { PageHeader } from "@/components/layouts/PageHeader";

export default function CreateGamePage() {
  return (
    <HostLayout showBackToDashboard maxWidth="lg">
      <div className="space-y-8">
        <PageHeader
          title="Setup Your Game"
          subtitle="Start hosting your Tambola game in minutes."
        />
        <CreateGameForm />
      </div>
    </HostLayout>
  );
}
