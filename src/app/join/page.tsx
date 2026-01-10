import type { Metadata } from "next";
import { JoinForm } from "./_components/JoinForm";

export const metadata: Metadata = {
  title: "Join a Game | Tambola",
  description:
    "Enter a game code to join a Tambola game with friends and family",
};

export default function JoinPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Join a Game
          </h1>
          <p className="text-muted-foreground">
            Enter the 6-character code shared by your host
          </p>
        </div>
        <JoinForm />
      </div>
    </div>
  );
}
