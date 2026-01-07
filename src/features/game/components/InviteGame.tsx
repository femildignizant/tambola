"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, Share2 } from "lucide-react";
import { useState, useId, useSyncExternalStore } from "react";
import { toast } from "sonner";

interface InviteGameProps {
  gameId: string;
  gameCode: string;
}

export function InviteGame({ gameId, gameCode }: InviteGameProps) {
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const id = useId();
  const gameCodeId = `${id}-code`;
  const inviteLinkId = `${id}-link`;

  const inviteLink = origin ? `${origin}/game/${gameId}` : "";

  const copyToClipboard = async (
    text: string,
    setCopied: (value: boolean) => void,
    message: string
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(message);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Invite Players
        </CardTitle>
        <CardDescription>
          Share this code or link with players to let them join the
          game.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor={gameCodeId}>Game Code</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id={gameCodeId}
                value={gameCode}
                readOnly
                className="font-mono text-lg font-bold tracking-widest text-center uppercase"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                copyToClipboard(
                  gameCode,
                  setCopiedCode,
                  "Game code copied!"
                )
              }
              title="Copy Game Code"
            >
              {copiedCode ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={inviteLinkId}>Share Link</Label>
          <div className="flex gap-2">
            <Input
              id={inviteLinkId}
              value={inviteLink}
              readOnly
              className="font-mono text-sm text-muted-foreground"
              placeholder="Loading link..."
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                copyToClipboard(
                  inviteLink,
                  setCopiedLink,
                  "Invite link copied!"
                )
              }
              disabled={!inviteLink}
              title="Copy Invite Link"
            >
              {copiedLink ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
