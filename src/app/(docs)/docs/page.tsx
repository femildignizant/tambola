import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Learn how to host and play Tambola games with our comprehensive guides.",
};

export default function DocsPage() {
  return (
    <div className="not-prose">
      {/* Hero Section */}
      <section className="py-8 md:py-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Welcome to Tambola Docs
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl">
          Everything you need to know about hosting and playing
          Tambola online. Choose a guide below to get started.
        </p>
      </section>

      {/* Guide Cards */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Host Guide Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Host Guide</CardTitle>
            </div>
            <CardDescription className="text-base">
              Learn how to create, customize, and manage Tambola games
              for your friends, family, or community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600 mb-6">
              <li>• Create and customize games</li>
              <li>• Configure patterns and points</li>
              <li>• Share with players via link or code</li>
              <li>• Manage gameplay and claims</li>
            </ul>
            <Button asChild className="w-full">
              <Link href="/docs/host">Read Host Guide</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Player Guide Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Player Guide</CardTitle>
            </div>
            <CardDescription className="text-base">
              Understand the rules, learn about patterns, and discover
              tips for winning your next Tambola game.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600 mb-6">
              <li>• Join games with a code or link</li>
              <li>• Understand your Tambola ticket</li>
              <li>• Learn all prize patterns</li>
              <li>• Make claims and win prizes</li>
            </ul>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/docs/player">Read Player Guide</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Quick Links Section */}
      <section className="mt-12 border-t pt-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Quick Links
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/docs/player#patterns"
            className="flex items-center gap-2 rounded-lg border p-3 hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-medium text-slate-900">
              Prize Patterns
            </span>
            <span className="text-xs text-slate-500">
              Visual guide to all patterns
            </span>
          </Link>
          <Link
            href="/docs/host#creating-a-game"
            className="flex items-center gap-2 rounded-lg border p-3 hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-medium text-slate-900">
              Creating a Game
            </span>
            <span className="text-xs text-slate-500">
              Step-by-step guide
            </span>
          </Link>
          <Link
            href="/docs/player#joining"
            className="flex items-center gap-2 rounded-lg border p-3 hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-medium text-slate-900">
              Joining a Game
            </span>
            <span className="text-xs text-slate-500">
              How to join using code
            </span>
          </Link>
          <Link
            href="/docs/player#claims"
            className="flex items-center gap-2 rounded-lg border p-3 hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-medium text-slate-900">
              Making Claims
            </span>
            <span className="text-xs text-slate-500">
              When and how to claim
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
