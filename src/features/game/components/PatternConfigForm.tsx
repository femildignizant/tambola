"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  gamePatternSchema,
  GamePatternsInput,
  PatternEnum,
} from "../lib/validation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Helper to get friendly names
const PatternNames: Record<string, string> = {
  FIRST_ROW: "First Row",
  SECOND_ROW: "Second Row",
  THIRD_ROW: "Third Row",
  EARLY_FIVE: "Early Five",
  FOUR_CORNERS: "Four Corners",
  FULL_HOUSE: "Full House",
};

import { GamePattern } from "@prisma/client";

interface PatternConfigFormProps {
  gameId: string;
  initialPatterns: GamePattern[];
}

export function PatternConfigForm({
  gameId,
  initialPatterns,
}: PatternConfigFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Initialize form default values
  // Parse all Enum options to ensure we render configuration for every possible pattern
  const allPatterns = PatternEnum.options;

  const defaultPatterns = allPatterns.map((patternCtx) => {
    const existing = initialPatterns.find(
      (p) => p.pattern === patternCtx
    );
    return {
      pattern: patternCtx,
      enabled: existing
        ? existing.enabled
        : patternCtx === "FULL_HOUSE", // Full House default on
      points1st:
        existing?.points1st ??
        (patternCtx === "FULL_HOUSE" ? 100 : 50),
      points2nd: existing?.points2nd ?? null,
      points3rd: existing?.points3rd ?? null,
    };
  });

  const form = useForm<GamePatternsInput>({
    resolver: zodResolver(gamePatternSchema),
    defaultValues: {
      patterns: defaultPatterns,
    },
  });

  async function onSubmit(data: GamePatternsInput) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/games/${gameId}/patterns`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(
          resData.error || "Failed to save configuration"
        );
      }

      setSuccess(true);
      router.refresh();

      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Patterns saved successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          {form.watch("patterns").map((field, index) => {
            const patternType = field.pattern;
            const isFullHouse = patternType === "FULL_HOUSE";
            const isEnabled = form.watch(`patterns.${index}.enabled`);

            return (
              <Card
                key={patternType}
                className={
                  isEnabled
                    ? "border-primary/50 shadow-sm"
                    : "opacity-75 border-dashed"
                }
              >
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 p-4">
                  <div className="flex flex-col">
                    <CardTitle className="text-base font-medium">
                      {PatternNames[patternType] || patternType}
                    </CardTitle>
                    {isFullHouse && (
                      <span className="text-xs text-muted-foreground">
                        Mandatory for ending the game
                      </span>
                    )}
                  </div>
                  <FormField
                    control={form.control}
                    name={`patterns.${index}.enabled`}
                    render={({ field: switchField }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={switchField.value}
                            onCheckedChange={switchField.onChange}
                            disabled={isFullHouse}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardHeader>
                {isEnabled && (
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`patterns.${index}.points1st`}
                        render={({ field: inputField }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              1st Prize
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...inputField}
                                onChange={(e) =>
                                  inputField.onChange(
                                    e.target.valueAsNumber
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`patterns.${index}.points2nd`}
                        render={({ field: p2Field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              2nd Prize (Opt)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                placeholder="None"
                                value={p2Field.value ?? ""}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === ""
                                      ? null
                                      : parseInt(e.target.value);
                                  p2Field.onChange(val);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`patterns.${index}.points3rd`}
                        render={({ field: p3Field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              3rd Prize (Opt)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                placeholder="None"
                                value={p3Field.value ?? ""}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === ""
                                      ? null
                                      : parseInt(e.target.value);
                                  p3Field.onChange(val);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Configuration"
          )}
        </Button>
      </form>
    </Form>
  );
}
