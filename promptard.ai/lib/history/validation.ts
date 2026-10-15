import { z } from "zod";

import { PROMPT_CONTENT_MAX_LENGTH } from "@/lib/history/constants";

export const promptContentSchema = z
  .string()
  .trim()
  .min(1, "Prompt cannot be empty")
  .max(PROMPT_CONTENT_MAX_LENGTH);

export const localHistoryItemSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(PROMPT_CONTENT_MAX_LENGTH),
  createdAt: z.string().datetime(),
});

export const mergeBodySchema = z.object({
  items: z.array(localHistoryItemSchema).max(100),
});

export const createHistoryBodySchema = z.object({
  content: promptContentSchema,
});
