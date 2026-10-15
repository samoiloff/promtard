import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  promptTemplateLikes,
  promptTemplateTags,
  promptTemplates,
  tags,
} from "@/lib/db/schema";
import { deriveTitle } from "@/lib/templates/validation";
import type {
  PromptTemplateItem,
  PromptTemplateViewItem,
} from "@/lib/templates/types";

async function upsertTagIds(tagNames: string[]): Promise<string[]> {
  if (tagNames.length === 0) return [];

  const ids: string[] = [];
  for (const name of tagNames) {
    const [inserted] = await db
      .insert(tags)
      .values({ name })
      .onConflictDoNothing({ target: tags.name })
      .returning({ id: tags.id });

    if (inserted) {
      ids.push(inserted.id);
      continue;
    }

    const [existing] = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.name, name))
      .limit(1);

    if (existing) ids.push(existing.id);
  }

  return ids;
}

async function loadTagsForTemplate(templateId: string): Promise<string[]> {
  const rows = await db
    .select({ name: tags.name })
    .from(promptTemplateTags)
    .innerJoin(tags, eq(promptTemplateTags.tagId, tags.id))
    .where(eq(promptTemplateTags.templateId, templateId));

  return rows.map((row) => row.name);
}

function toItem(
  row: typeof promptTemplates.$inferSelect,
  tagNames: string[],
): PromptTemplateItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tags: tagNames,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function userLikedTemplate(
  userId: string,
  templateId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ userId: promptTemplateLikes.userId })
    .from(promptTemplateLikes)
    .where(
      and(
        eq(promptTemplateLikes.userId, userId),
        eq(promptTemplateLikes.templateId, templateId),
      ),
    )
    .limit(1);

  return Boolean(row);
}

export async function getPromptTemplateForViewer(
  userId: string,
  templateId: string,
): Promise<PromptTemplateViewItem | null> {
  const [row] = await db
    .select()
    .from(promptTemplates)
    .where(eq(promptTemplates.id, templateId))
    .limit(1);

  if (!row) return null;

  const tagNames = await loadTagsForTemplate(row.id);
  const item = toItem(row, tagNames);

  if (row.authorId === userId) {
    return { ...item, canEdit: true };
  }

  const liked = await userLikedTemplate(userId, templateId);
  if (row.isPrivate && !liked) return null;

  return { ...item, canEdit: false };
}

export async function getPromptTemplateForUser(
  userId: string,
  templateId: string,
): Promise<PromptTemplateItem | null> {
  const [row] = await db
    .select()
    .from(promptTemplates)
    .where(
      and(
        eq(promptTemplates.id, templateId),
        eq(promptTemplates.authorId, userId),
      ),
    )
    .limit(1);

  if (!row) return null;

  const tagNames = await loadTagsForTemplate(row.id);
  return toItem(row, tagNames);
}

export async function createPromptTemplateForUser(
  userId: string,
  body: string,
  tagNames: string[],
): Promise<PromptTemplateItem> {
  const title = deriveTitle(body);
  const now = new Date();

  const [row] = await db
    .insert(promptTemplates)
    .values({
      authorId: userId,
      title,
      body,
      updatedAt: now,
    })
    .returning();

  const tagIds = await upsertTagIds(tagNames);
  if (tagIds.length > 0) {
    await db.insert(promptTemplateTags).values(
      tagIds.map((tagId) => ({
        templateId: row.id,
        tagId,
      })),
    );
  }

  return toItem(row, tagNames);
}

export async function updatePromptTemplateForUser(
  userId: string,
  templateId: string,
  body: string,
  tagNames: string[],
): Promise<PromptTemplateItem | null> {
  const title = deriveTitle(body);
  const now = new Date();

  const [row] = await db
    .update(promptTemplates)
    .set({
      body,
      title,
      updatedAt: now,
    })
    .where(
      and(
        eq(promptTemplates.id, templateId),
        eq(promptTemplates.authorId, userId),
      ),
    )
    .returning();

  if (!row) return null;

  await db
    .delete(promptTemplateTags)
    .where(eq(promptTemplateTags.templateId, templateId));

  const tagIds = await upsertTagIds(tagNames);
  if (tagIds.length > 0) {
    await db.insert(promptTemplateTags).values(
      tagIds.map((tagId) => ({
        templateId: row.id,
        tagId,
      })),
    );
  }

  return toItem(row, tagNames);
}

export async function deletePromptTemplateForUser(
  userId: string,
  templateId: string,
): Promise<boolean> {
  const result = await db
    .delete(promptTemplates)
    .where(
      and(
        eq(promptTemplates.id, templateId),
        eq(promptTemplates.authorId, userId),
      ),
    )
    .returning({ id: promptTemplates.id });

  return result.length > 0;
}
