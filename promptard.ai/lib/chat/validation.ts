import { z } from "zod";

import { GROQ_MODELS } from "@/lib/groq/models";
import { PROMPT_CONTENT_MAX_LENGTH } from "@/lib/history/constants";

const modelIds = GROQ_MODELS.map((m) => m.id) as [string, ...string[]];

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(PROMPT_CONTENT_MAX_LENGTH),
});

export const chatRequestSchema = z.object({
  model: z.enum(modelIds),
  messages: z.array(chatMessageSchema).min(1).max(50),
});
