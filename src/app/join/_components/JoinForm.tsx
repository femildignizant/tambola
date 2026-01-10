"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function JoinForm() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmitting = useRef(false);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Only allow alphanumeric characters, auto-uppercase, limit to 6 chars
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    setCode(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    // Prevent double submission with ref (synchronous check)
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    setIsLoading(true);
    try {
      const res = await fetch("/api/games/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      router.push(`/game/${data.data.gameId}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div className="space-y-2">
        <Input
          ref={inputRef}
          value={code}
          onChange={handleInputChange}
          placeholder="ABC123"
          className="text-center text-2xl tracking-[0.5em] font-mono h-14"
          maxLength={6}
          disabled={isLoading}
          aria-label="Game code"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
        <p className="text-xs text-muted-foreground">
          {code.length}/6 characters
        </p>
      </div>
      <Button
        type="submit"
        className="w-full h-12 text-lg"
        disabled={code.length !== 6 || isLoading}
      >
        {isLoading ? "Finding Game..." : "Join Game"}
      </Button>
    </form>
  );
}
