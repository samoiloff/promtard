import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { promptTemplateLikes, promptTemplates, users } from "@/lib/db/schema";
import { previewTemplateBody } from "@/lib/templates/preview";
import { loadTagsByTemplateIds } from "@/lib/templates/tag-queries";
import type { PromptTemplateListItem } from "@/lib/templates/types";

function toListItem(
  row: typeof promptTemplates.$inferSelect,
  tagNames: string[],
  options: { authorName?: string | null; canEdit: boolean },
): PromptTemplateListItem {
  return {
    id: row.id,
    title: row.title,
    bodyPreview: previewTemplateBody(row.body),
    tags: tagNames,
    updatedAt: row.updatedAt.toISOString(),
    authorName: options.authorName,
    canEdit: options.canEdit,
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
  return rows.map((row) =>
    toListItem(row, tagMap.get(row.id) ?? [], { canEdit: true }),
  );
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
    toListItem(template, tagMap.get(template.id) ?? [], {
      authorName,
      canEdit: template.authorId === userId,
    }),
  );
}
