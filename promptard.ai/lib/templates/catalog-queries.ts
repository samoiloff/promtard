import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  promptTemplateLikes,
  promptTemplateTags,
  promptTemplates,
  tags,
  users,
} from "@/lib/db/schema";
import { previewTemplateBody } from "@/lib/templates/preview";
import type { PublicTemplateListItem } from "@/lib/templates/types";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function clampLimit(limit?: number): number {
  if (!limit || limit < 1) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

async function likeCountsForTemplates(
  templateIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (templateIds.length === 0) return map;

  const rows = await db
    .select({
      templateId: promptTemplateLikes.templateId,
      count: sql<number>`count(*)::int`,
    })
    .from(promptTemplateLikes)
    .where(inArray(promptTemplateLikes.templateId, templateIds))
    .groupBy(promptTemplateLikes.templateId);

  for (const row of rows) {
    map.set(row.templateId, row.count);
  }
  return map;
}

async function likedTemplateIdsForUser(
  userId: string,
  templateIds: string[],
): Promise<Set<string>> {
  const set = new Set<string>();
  if (templateIds.length === 0) return set;

  const rows = await db
    .select({ templateId: promptTemplateLikes.templateId })
    .from(promptTemplateLikes)
    .where(
      and(
        eq(promptTemplateLikes.userId, userId),
        inArray(promptTemplateLikes.templateId, templateIds),
      ),
    );

  for (const row of rows) set.add(row.templateId);
  return set;
}

type TemplateRow = {
  template: typeof promptTemplates.$inferSelect;
  authorName: string | null;
};

function toPublicItems(
  rows: TemplateRow[],
  userId: string | null,
): Promise<PublicTemplateListItem[]> {
  const ids = rows.map((r) => r.template.id);
  return Promise.all([
    likeCountsForTemplates(ids),
    userId ? likedTemplateIdsForUser(userId, ids) : Promise.resolve(new Set()),
  ]).then(([counts, liked]) =>
    rows.map(({ template, authorName }) => ({
      id: template.id,
      title: template.title,
      bodyPreview: previewTemplateBody(template.body),
      authorName,
      createdAt: template.createdAt.toISOString(),
      likeCount: counts.get(template.id) ?? 0,
      likedByMe: liked.has(template.id),
    })),
  );
}

async function fetchPublicTemplatesByIds(
  ids: string[],
  userId: string | null,
): Promise<PublicTemplateListItem[]> {
  if (ids.length === 0) return [];

  const rows = await db
    .select({
      template: promptTemplates,
      authorName: users.name,
    })
    .from(promptTemplates)
    .innerJoin(users, eq(promptTemplates.authorId, users.id))
    .where(
      and(
        inArray(promptTemplates.id, ids),
        eq(promptTemplates.isPrivate, false),
      ),
    );

  const order = new Map(ids.map((id, index) => [id, index]));
  rows.sort(
    (a, b) =>
      (order.get(a.template.id) ?? 0) - (order.get(b.template.id) ?? 0),
  );

  return toPublicItems(rows, userId);
}

export async function listRecentPublicTemplates(
  userId: string | null,
  limit?: number,
): Promise<PublicTemplateListItem[]> {
  const take = clampLimit(limit);
  const rows = await db
    .select({
      template: promptTemplates,
      authorName: users.name,
    })
    .from(promptTemplates)
    .innerJoin(users, eq(promptTemplates.authorId, users.id))
    .where(eq(promptTemplates.isPrivate, false))
    .orderBy(desc(promptTemplates.createdAt))
    .limit(take);

  return toPublicItems(rows, userId);
}

export async function listPopularPublicTemplates(
  userId: string | null,
  limit?: number,
): Promise<PublicTemplateListItem[]> {
  const take = clampLimit(limit);
  const rows = await db
    .select({
      template: promptTemplates,
      authorName: users.name,
      likeCount: sql<number>`count(${promptTemplateLikes.userId})::int`,
    })
    .from(promptTemplates)
    .innerJoin(users, eq(promptTemplates.authorId, users.id))
    .leftJoin(
      promptTemplateLikes,
      eq(promptTemplateLikes.templateId, promptTemplates.id),
    )
    .where(eq(promptTemplates.isPrivate, false))
    .groupBy(promptTemplates.id, users.id, users.name)
    .orderBy(
      desc(sql`count(${promptTemplateLikes.userId})`),
      desc(promptTemplates.createdAt),
    )
    .limit(take);

  const liked =
    userId && rows.length > 0
      ? await likedTemplateIdsForUser(
          userId,
          rows.map((r) => r.template.id),
        )
      : new Set<string>();

  return rows.map(({ template, authorName, likeCount }) => ({
    id: template.id,
    title: template.title,
    bodyPreview: previewTemplateBody(template.body),
    authorName,
    createdAt: template.createdAt.toISOString(),
    likeCount,
    likedByMe: liked.has(template.id),
  }));
}

export async function searchPublicTemplates(
  userId: string | null,
  query: string,
  limit?: number,
): Promise<PublicTemplateListItem[]> {
  const q = query.trim();
  if (!q) return [];

  const take = clampLimit(limit);
  const pattern = `%${q}%`;

  const byTitle = await db
    .select({ id: promptTemplates.id })
    .from(promptTemplates)
    .where(
      and(
        eq(promptTemplates.isPrivate, false),
        ilike(promptTemplates.title, pattern),
      ),
    )
    .limit(take);

  const byTag = await db
    .select({ id: promptTemplates.id })
    .from(promptTemplates)
    .innerJoin(
      promptTemplateTags,
      eq(promptTemplateTags.templateId, promptTemplates.id),
    )
    .innerJoin(tags, eq(promptTemplateTags.tagId, tags.id))
    .where(
      and(eq(promptTemplates.isPrivate, false), ilike(tags.name, pattern)),
    )
    .limit(take);

  const seen = new Set<string>();
  const ids: string[] = [];
  for (const row of [...byTitle, ...byTag]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    ids.push(row.id);
    if (ids.length >= take) break;
  }

  return fetchPublicTemplatesByIds(ids, userId);
}

export async function likePublicTemplate(
  userId: string,
  templateId: string,
): Promise<{ likeCount: number; likedByMe: true } | null> {
  const [template] = await db
    .select({ id: promptTemplates.id, isPrivate: promptTemplates.isPrivate })
    .from(promptTemplates)
    .where(eq(promptTemplates.id, templateId))
    .limit(1);

  if (!template || template.isPrivate) return null;

  await db
    .insert(promptTemplateLikes)
    .values({ userId, templateId })
    .onConflictDoNothing();

  const counts = await likeCountsForTemplates([templateId]);
  return {
    likeCount: counts.get(templateId) ?? 0,
    likedByMe: true,
  };
}

export async function unlikePublicTemplate(
  userId: string,
  templateId: string,
): Promise<{ likeCount: number; likedByMe: false } | null> {
  const [template] = await db
    .select({ id: promptTemplates.id })
    .from(promptTemplates)
    .where(eq(promptTemplates.id, templateId))
    .limit(1);

  if (!template) return null;

  await db
    .delete(promptTemplateLikes)
    .where(
      and(
        eq(promptTemplateLikes.userId, userId),
        eq(promptTemplateLikes.templateId, templateId),
      ),
    );

  const counts = await likeCountsForTemplates([templateId]);
  return {
    likeCount: counts.get(templateId) ?? 0,
    likedByMe: false,
  };
}
