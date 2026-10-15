import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { promptHistory } from "@/lib/db/schema";
import { PROMPT_HISTORY_MAX_ITEMS } from "@/lib/history/constants";
import type { LocalPromptHistoryItem, PromptHistoryItem } from "@/lib/history/types";

export async function listPromptHistoryForUser(
  userId: string,
  limit = PROMPT_HISTORY_MAX_ITEMS,
): Promise<PromptHistoryItem[]> {
  const rows = await db
    .select()
    .from(promptHistory)
    .where(eq(promptHistory.userId, userId))
    .orderBy(desc(promptHistory.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function createPromptHistoryForUser(
  userId: string,
  content: string,
): Promise<PromptHistoryItem> {
  const [row] = await db
    .insert(promptHistory)
    .values({ userId, content })
    .returning();

  return {
    id: row.id,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function mergeLocalHistoryForUser(
  userId: string,
  items: LocalPromptHistoryItem[],
): Promise<number> {
  if (items.length === 0) return 0;

  const existing = await listPromptHistoryForUser(userId, PROMPT_HISTORY_MAX_ITEMS);
  const existingKeys = new Set(
    existing.map((item) => `${item.content}\0${item.createdAt}`),
  );

  const toInsert = items.filter(
    (item) => !existingKeys.has(`${item.content}\0${item.createdAt}`),
  );

  if (toInsert.length === 0) return 0;

  await db.insert(promptHistory).values(
    toInsert.map((item) => ({
      userId,
      content: item.content,
      createdAt: new Date(item.createdAt),
    })),
  );

  return toInsert.length;
}
