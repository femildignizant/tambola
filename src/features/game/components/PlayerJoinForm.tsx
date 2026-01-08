"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PlayerJoinFormProps {
  gameId: string;
  onJoinSuccess: (data: {
    player: { id: string; name: string; joinedAt: string };
    ticket: { id: string; grid: number[][] };
    token: string;
  }) => void;
}

export function PlayerJoinForm({
  gameId,
  onJoinSuccess,
}: PlayerJoinFormProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length === 0) {
      setError("Please enter your name");
      return;
    }

    if (name.length > 20) {
      setError("Name must be 20 characters or less");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/games/${gameId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to join game");
        return;
      }

      // Store token in localStorage
      localStorage.setItem(`game-${gameId}-token`, result.data.token);

      // Call success handler
      onJoinSuccess(result.data);
    } catch (err) {
      console.error("Join error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join Game</CardTitle>
        <CardDescription>
          Enter your name to join the game
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              maxLength={20}
              autoFocus
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Joining..." : "Join Game"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
