import { eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { promptTemplateTags, tags } from "@/lib/db/schema";

export async function loadTagsByTemplateIds(
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
