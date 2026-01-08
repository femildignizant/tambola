import { z } from "zod";

export const createGameSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;

export const PatternEnum = z.enum([
  "FIRST_ROW",
  "SECOND_ROW",
  "THIRD_ROW",
  "EARLY_FIVE",
  "FOUR_CORNERS",
  "FULL_HOUSE",
]);

export type PatternType = z.infer<typeof PatternEnum>;

export const singlePatternSchema = z.object({
  pattern: PatternEnum,
  enabled: z.boolean(),
  points1st: z.number().int().positive("Points must be positive"),
  points2nd: z
    .number()
    .int()
    .positive("Points must be positive")
    .optional()
    .nullable(),
  points3rd: z
    .number()
    .int()
    .positive("Points must be positive")
    .optional()
    .nullable(),
});

export const gamePatternSchema = z.object({
  patterns: z.array(singlePatternSchema).refine(
    (patterns) => {
      const fullHouse = patterns.find(
        (p) => p.pattern === "FULL_HOUSE"
      );
      return fullHouse?.enabled;
    },
    {
      message: "FULL_HOUSE pattern must be enabled",
      path: ["patterns"], // error will be attached to the patterns array
    }
  ),
});

export type GamePatternsInput = z.infer<typeof gamePatternSchema>;

import {
  GAME_INTERVALS,
  MAX_PLAYERS,
  MIN_PLAYERS,
} from "./constants";

export const gameSettingsSchema = z
  .object({
    numberInterval: z
      .union([
        z.literal(GAME_INTERVALS[0]),
        z.literal(GAME_INTERVALS[1]),
        z.literal(GAME_INTERVALS[2]),
      ])
      .refine((val) => GAME_INTERVALS.includes(val), {
        message: `Interval must be ${GAME_INTERVALS.join(
          ", "
        )} seconds`,
      }),
    minPlayers: z
      .number()
      .int()
      .min(
        MIN_PLAYERS,
        `Minimum players must be at least ${MIN_PLAYERS}`
      )
      .max(
        MAX_PLAYERS,
        `Minimum players cannot exceed ${MAX_PLAYERS}`
      ),
    maxPlayers: z
      .number()
      .int()
      .min(
        MIN_PLAYERS,
        `Maximum players must be at least ${MIN_PLAYERS}`
      )
      .max(
        MAX_PLAYERS,
        `Maximum players cannot exceed ${MAX_PLAYERS}`
      ),
  })
  .refine((data) => data.minPlayers <= data.maxPlayers, {
    message:
      "Minimum players must be less than or equal to maximum players",
    path: ["minPlayers"], // Attach error to minPlayers
  });

export type GameSettingsInput = z.infer<typeof gameSettingsSchema>;
