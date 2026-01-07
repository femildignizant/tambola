import { CreateGameForm } from "@/features/game/components/CreateGameForm";

export default function CreateGamePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Setup Your Game
          </h1>
          <p className="text-muted-foreground mt-2">
            Start hosting your Tambola game in minutes.
          </p>
        </div>
        <CreateGameForm />
      </div>
    </div>
  );
}
