import { desc, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  promptTemplateLikes,
  promptTemplateTags,
  promptTemplates,
  tags,
  users,
} from "@/lib/db/schema";
import { previewTemplateBody } from "@/lib/templates/preview";
import type { PromptTemplateListItem } from "@/lib/templates/types";

async function loadTagsByTemplateIds(
  templateIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (templateIds.length === 0) return map;

  const rows = await db
    .select({
      templateId: promptTemplateTags.templateId,
      name: tags.name,
    })
    .from(promptTemplateTags)
    .innerJoin(tags, eq(promptTemplateTags.tagId, tags.id))
    .where(inArray(promptTemplateTags.templateId, templateIds));

  for (const row of rows) {
    const list = map.get(row.templateId) ?? [];
    list.push(row.name);
    map.set(row.templateId, list);
  }

  return map;
}

function toListItem(
  row: typeof promptTemplates.$inferSelect,
  tagNames: string[],
  authorName?: string | null,
): PromptTemplateListItem {
  return {
    id: row.id,
    title: row.title,
    bodyPreview: previewTemplateBody(row.body),
    tags: tagNames,
    updatedAt: row.updatedAt.toISOString(),
    authorName,
  };
}

export async function listPromptTemplatesForAuthor(
  userId: string,
): Promise<PromptTemplateListItem[]> {
  const rows = await db
    .select()
    .from(promptTemplates)
    .where(eq(promptTemplates.authorId, userId))
    .orderBy(desc(promptTemplates.updatedAt));

  const tagMap = await loadTagsByTemplateIds(rows.map((r) => r.id));
  return rows.map((row) => toListItem(row, tagMap.get(row.id) ?? []));
}

export async function listLikedPromptTemplatesForUser(
  userId: string,
): Promise<PromptTemplateListItem[]> {
  const rows = await db
    .select({
      template: promptTemplates,
      authorName: users.name,
    })
    .from(promptTemplateLikes)
    .innerJoin(
      promptTemplates,
      eq(promptTemplateLikes.templateId, promptTemplates.id),
    )
    .innerJoin(users, eq(promptTemplates.authorId, users.id))
    .where(eq(promptTemplateLikes.userId, userId))
    .orderBy(desc(promptTemplateLikes.createdAt));

  const tagMap = await loadTagsByTemplateIds(rows.map((r) => r.template.id));

  return rows.map(({ template, authorName }) =>
    toListItem(template, tagMap.get(template.id) ?? [], authorName),
  );
}
