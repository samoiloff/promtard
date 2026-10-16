import { z } from "zod";

import type { AdminTableKey } from "@/lib/admin/table-registry";
import { templateBodySchema } from "@/lib/templates/validation";

const optionalText = z.string().nullable().optional();
const requiredText = z.string().min(1);

const dateInput = z.string().min(1);

const schemas: Record<
  AdminTableKey,
  { insert: z.ZodType<Record<string, unknown>>; update: z.ZodType<Record<string, unknown>> }
> = {
  users: {
    insert: z.object({
      id: requiredText.optional(),
      name: optionalText,
      email: z.string().email().nullable().optional(),
      emailVerified: dateInput.nullable().optional(),
      image: optionalText,
    }),
    update: z.object({
      name: optionalText,
      email: z.string().email().nullable().optional(),
      emailVerified: dateInput.nullable().optional(),
      image: optionalText,
    }),
  },
  prompt_templates: {
    insert: z.object({
      id: z.string().uuid().optional(),
      authorId: requiredText,
      title: optionalText,
      body: templateBodySchema,
      isPrivate: z.boolean().optional(),
      createdAt: dateInput.optional(),
      updatedAt: dateInput.optional(),
    }),
    update: z.object({
      authorId: requiredText.optional(),
      title: optionalText,
      body: templateBodySchema.optional(),
      isPrivate: z.boolean().optional(),
      updatedAt: dateInput.optional(),
    }),
  },
  prompt_history: {
    insert: z.object({
      id: z.string().uuid().optional(),
      userId: requiredText,
      content: requiredText,
      createdAt: dateInput.optional(),
    }),
    update: z.object({
      userId: requiredText.optional(),
      content: requiredText.optional(),
      createdAt: dateInput.optional(),
    }),
  },
  tags: {
    insert: z.object({
      id: z.string().uuid().optional(),
      name: requiredText,
    }),
    update: z.object({
      name: requiredText.optional(),
    }),
  },
  prompt_template_tags: {
    insert: z.object({
      templateId: z.string().uuid(),
      tagId: z.string().uuid(),
    }),
    update: z.object({}),
  },
  prompt_template_likes: {
    insert: z.object({
      userId: requiredText,
      templateId: z.string().uuid(),
      createdAt: dateInput.optional(),
    }),
    update: z.object({
      createdAt: dateInput.optional(),
    }),
  },
  prompt_template_favorites: {
    insert: z.object({
      userId: requiredText,
      templateId: z.string().uuid(),
      createdAt: dateInput.optional(),
    }),
    update: z.object({
      createdAt: dateInput.optional(),
    }),
  },
  accounts: {
    insert: z.object({
      userId: requiredText,
      type: requiredText,
      provider: requiredText,
      providerAccountId: requiredText,
      expires_at: z.number().int().nullable().optional(),
      token_type: optionalText,
      scope: optionalText,
      session_state: optionalText,
    }),
    update: z.object({
      userId: requiredText.optional(),
      type: requiredText.optional(),
      expires_at: z.number().int().nullable().optional(),
      token_type: optionalText,
      scope: optionalText,
      session_state: optionalText,
    }),
  },
  sessions: {
    insert: z.object({
      sessionToken: requiredText,
      userId: requiredText,
      expires: dateInput,
    }),
    update: z.object({
      userId: requiredText.optional(),
      expires: dateInput.optional(),
    }),
  },
  verification_tokens: {
    insert: z.object({
      identifier: requiredText,
      token: requiredText,
      expires: dateInput,
    }),
    update: z.object({
      expires: dateInput.optional(),
    }),
  },
};

export function validateInsert(
  tableKey: AdminTableKey,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const parsed = schemas[tableKey].insert.safeParse(values);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid data");
  }
  return coerceDates(parsed.data);
}

export function validateUpdate(
  tableKey: AdminTableKey,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const parsed = schemas[tableKey].update.safeParse(values);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid data");
  }
  const data = coerceDates(parsed.data);
  if (Object.keys(data).length === 0) {
    throw new Error("No fields to update");
  }
  return data;
}

function coerceDates(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...data };
  for (const key of [
    "emailVerified",
    "createdAt",
    "updatedAt",
    "expires",
  ] as const) {
    if (key in out && typeof out[key] === "string") {
      out[key] = new Date(out[key] as string);
    }
  }
  return out;
}
