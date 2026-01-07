import { z } from "zod";

export const createGameSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
