"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { GAME_INTERVALS } from "../lib/constants";
import {
  GameSettingsInput,
  gameSettingsSchema,
} from "../lib/validation";

interface GameSettingsFormProps {
  gameId: string;
  initialValues: GameSettingsInput;
}

export function GameSettingsForm({
  gameId,
  initialValues,
}: GameSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<GameSettingsInput>({
    resolver: zodResolver(gameSettingsSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (values: GameSettingsInput) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      let result: { error?: string };
      try {
        result = await response.json();
      } catch (e) {
        // If response is not JSON (e.g. 500 html page), treat as error
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`
        );
      }

      if (!response.ok) {
        throw new Error(result.error || "Failed to update settings");
      }

      toast.success("Game settings updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Update error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Config</CardTitle>
        <CardDescription>
          Configure the pace and player limits for your game.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="numberInterval"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Number Calling Interval</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(val) =>
                        field.onChange(parseInt(val, 10))
                      }
                      defaultValue={field.value.toString()}
                      className="flex flex-col space-y-1"
                    >
                      {GAME_INTERVALS.map((interval) => (
                        <FormItem
                          key={interval}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem
                              value={interval.toString()}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {interval === 2
                              ? "⚡ Turbo (2s)"
                              : interval === 7
                              ? "Fast (7s)"
                              : interval === 10
                              ? "Normal (10s)"
                              : "Relaxed (15s)"}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minPlayers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Players</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.valueAsNumber || undefined
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
                name="maxPlayers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Players</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.valueAsNumber || undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Update Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
