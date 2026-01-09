"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link";
}

/**
 * BackButton - Consistent back navigation component
 *
 * Provides unified back navigation with router integration.
 * Can navigate to specific href or use browser history.
 */
export function BackButton({
  href,
  label = "Back",
  className,
  variant = "ghost",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      className={cn("gap-2", className)}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
