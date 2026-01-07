import { LogoutButton } from "@/components/LogoutButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Dashboard
          </CardTitle>
          <LogoutButton />
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-white p-8 text-center shadow-sm space-y-4">
            <h2 className="mb-2 text-xl font-semibold">
              Welcome to Tambola!
            </h2>
            <p className="text-gray-600">
              You have successfully logged in. This is your personal
              dashboard.
            </p>
            <div className="pt-4">
              <Link href="/dashboard/create">
                <Button>Create New Game</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
