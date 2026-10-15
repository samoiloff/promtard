import { z } from "zod";

import {
  TEMPLATE_BODY_MAX_LENGTH,
  TEMPLATE_TITLE_MAX_LENGTH,
} from "@/lib/templates/constants";

export const templateBodySchema = z
  .string()
  .trim()
  .min(1, "Prompt cannot be empty")
  .max(TEMPLATE_BODY_MAX_LENGTH);

export const templateTagsSchema = z.array(z.string().min(1).max(64)).max(50);

export const createTemplateBodySchema = z.object({
  body: templateBodySchema,
  tags: templateTagsSchema.default([]),
  isPublic: z.boolean().optional().default(true),
});

export const updateTemplateBodySchema = z.object({
  body: templateBodySchema,
  tags: templateTagsSchema.default([]),
  isPublic: z.boolean().optional(),
});

export function deriveTitle(body: string): string {
  const withoutPlaceholders = body.replace(/\$\{[^}]+\}/g, " ");
  const collapsed = withoutPlaceholders.replace(/\s+/g, " ").trim();
  if (!collapsed) return "Template";
  return collapsed.slice(0, TEMPLATE_TITLE_MAX_LENGTH);
}

export function parseTagsInput(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of raw.split(",")) {
    const name = part.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}

export function formatTagsInput(tags: string[]): string {
  return tags.join(", ");
}
