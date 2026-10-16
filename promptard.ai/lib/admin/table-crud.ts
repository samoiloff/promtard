import { and, count, desc, eq } from "drizzle-orm";

import { getAdminTable, type AdminTableKey } from "@/lib/admin/table-registry";
import { serializeRows } from "@/lib/admin/row-serialize";
import { validateInsert, validateUpdate } from "@/lib/admin/table-schemas";
import { db } from "@/lib/db";
import {
  accounts,
  promptHistory,
  promptTemplateFavorites,
  promptTemplateLikes,
  promptTemplates,
  promptTemplateTags,
  sessions,
  tags,
  users,
  verificationTokens,
} from "@/lib/db/schema";
import { deriveTitle } from "@/lib/templates/validation";

const MAX_LIMIT = 100;

export type ListResult = {
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
};

function clampPagination(page: number, limit: number) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit));
  return { page: safePage, limit: safeLimit, offset: (safePage - 1) * safeLimit };
}

function pkWhere(
  tableKey: AdminTableKey,
  primaryKey: Record<string, unknown>,
) {
  const def = getAdminTable(tableKey)!;
  const conditions = def.primaryKey.map((key) => {
    const value = primaryKey[key];
    if (value === undefined || value === null || value === "") {
      throw new Error(`Missing primary key: ${key}`);
    }
    return eqColumn(tableKey, key, value);
  });
  return conditions.length === 1 ? conditions[0] : and(...conditions);
}

function eqColumn(tableKey: AdminTableKey, key: string, value: unknown) {
  switch (tableKey) {
    case "users":
      if (key === "id") return eq(users.id, String(value));
      break;
    case "prompt_templates":
      if (key === "id") return eq(promptTemplates.id, String(value));
      break;
    case "prompt_history":
      if (key === "id") return eq(promptHistory.id, String(value));
      break;
    case "tags":
      if (key === "id") return eq(tags.id, String(value));
      break;
    case "prompt_template_tags":
      if (key === "templateId") return eq(promptTemplateTags.templateId, String(value));
      if (key === "tagId") return eq(promptTemplateTags.tagId, String(value));
      break;
    case "prompt_template_likes":
      if (key === "userId") return eq(promptTemplateLikes.userId, String(value));
      if (key === "templateId")
        return eq(promptTemplateLikes.templateId, String(value));
      break;
    case "prompt_template_favorites":
      if (key === "userId") return eq(promptTemplateFavorites.userId, String(value));
      if (key === "templateId")
        return eq(promptTemplateFavorites.templateId, String(value));
      break;
    case "accounts":
      if (key === "provider") return eq(accounts.provider, String(value));
      if (key === "providerAccountId")
        return eq(accounts.providerAccountId, String(value));
      break;
    case "sessions":
      if (key === "sessionToken") return eq(sessions.sessionToken, String(value));
      break;
    case "verification_tokens":
      if (key === "identifier") return eq(verificationTokens.identifier, String(value));
      if (key === "token") return eq(verificationTokens.token, String(value));
      break;
  }
  throw new Error(`Unknown column ${key}`);
}

export async function listAdminRows(
  tableKey: AdminTableKey,
  page = 1,
  limit = 50,
): Promise<ListResult> {
  const { page: p, limit: l, offset } = clampPagination(page, limit);

  switch (tableKey) {
    case "users": {
      const [totalRow] = await db.select({ count: count() }).from(users);
      const rows = await db
        .select()
        .from(users)
        .orderBy(desc(users.id))
        .limit(l)
        .offset(offset);
      return {
        rows: serializeRows(tableKey, rows),
        total: totalRow?.count ?? 0,
        page: p,
        limit: l,
      };
    }
    case "prompt_templates": {
      const [totalRow] = await db.select({ count: count() }).from(promptTemplates);
      const rows = await db
        .select()
        .from(promptTemplates)
        .orderBy(desc(promptTemplates.createdAt))
        .limit(l)
        .offset(offset);
      return {
        rows: serializeRows(tableKey, rows),
        total: totalRow?.count ?? 0,
        page: p,
        limit: l,
      };
    }
    case "prompt_history": {
      const [totalRow] = await db.select({ count: count() }).from(promptHistory);
      const rows = await db
        .select()
        .from(promptHistory)
        .orderBy(desc(promptHistory.createdAt))
        .limit(l)
        .offset(offset);
      return {
        rows: serializeRows(tableKey, rows),
        total: totalRow?.count ?? 0,
        page: p,
        limit: l,
      };
    }
    case "tags": {
      const [totalRow] = await db.select({ count: count() }).from(tags);
      const rows = await db
        .select()
        .from(tags)
        .orderBy(desc(tags.name))
        .limit(l)
        .offset(offset);
      return {
        rows: serializeRows(tableKey, rows),
        total: totalRow?.count ?? 0,
        page: p,
        limit: l,
      };
    }
    case "prompt_template_tags": {
      const [totalRow] = await db
        .select({ count: count() })
        .from(promptTemplateTags);
      const rows = await db.select().from(promptTemplateTags).limit(l).offset(offset);
      return {
        rows: serializeRows(tableKey, rows),
        total: totalRow?.count ?? 0,
        page: p,
        limit: l,
      };
    }
    case "prompt_template_likes": {
      const [totalRow] = await db
        .select({ count: count() })
        .from(promptTemplateLikes);
      const rows = await db
        .select()
        .from(promptTemplateLikes)
        .orderBy(desc(promptTemplateLikes.createdAt))
        .limit(l)
        .offset(offset);
      return {
        rows: serializeRows(tableKey, rows),
        total: totalRow?.count ?? 0,
        page: p,
        limit: l,
      };
    }
    case "prompt_template_favorites": {
      const [totalRow] = await db
        .select({ count: count() })
        .from(promptTemplateFavorites);
      const rows = await db
        .select()
        .from(promptTemplateFavorites)
        .orderBy(desc(promptTemplateFavorites.createdAt))
        .limit(l)
        .offset(offset);
      return {
        rows: serializeRows(tableKey, rows),
        total: totalRow?.count ?? 0,
        page: p,
        limit: l,
      };
    }
    case "accounts": {
      const [totalRow] = await db.select({ count: count() }).from(accounts);
      const rows = await db.select().from(accounts).limit(l).offset(offset);
      return {
        rows: serializeRows(tableKey, rows),
        total: totalRow?.count ?? 0,
        page: p,
        limit: l,
      };
    }
    case "sessions": {
      const [totalRow] = await db.select({ count: count() }).from(sessions);
      const rows = await db
        .select()
        .from(sessions)
        .orderBy(desc(sessions.expires))
        .limit(l)
        .offset(offset);
      return {
        rows: serializeRows(tableKey, rows),
        total: totalRow?.count ?? 0,
        page: p,
        limit: l,
      };
    }
    case "verification_tokens": {
      const [totalRow] = await db
        .select({ count: count() })
        .from(verificationTokens);
      const rows = await db
        .select()
        .from(verificationTokens)
        .orderBy(desc(verificationTokens.expires))
        .limit(l)
        .offset(offset);
      return {
        rows: serializeRows(tableKey, rows),
        total: totalRow?.count ?? 0,
        page: p,
        limit: l,
      };
    }
    default:
      throw new Error("Unknown table");
  }
}

export async function createAdminRow(
  tableKey: AdminTableKey,
  raw: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const values = validateInsert(tableKey, raw);
  const now = new Date();

  try {
    switch (tableKey) {
      case "users": {
        const id = (values.id as string | undefined) ?? crypto.randomUUID();
        const [row] = await db
          .insert(users)
          .values({
            id,
            name: (values.name as string | null) ?? null,
            email: (values.email as string | null) ?? null,
            emailVerified: (values.emailVerified as Date | null) ?? null,
            image: (values.image as string | null) ?? null,
          })
          .returning();
        return serializeRows(tableKey, [row])[0];
      }
      case "prompt_templates": {
        const body = values.body as string;
        const [row] = await db
          .insert(promptTemplates)
          .values({
            authorId: values.authorId as string,
            title: (values.title as string | null) ?? deriveTitle(body),
            body,
            isPrivate: (values.isPrivate as boolean | undefined) ?? false,
            createdAt: (values.createdAt as Date | undefined) ?? now,
            updatedAt: (values.updatedAt as Date | undefined) ?? now,
          })
          .returning();
        return serializeRows(tableKey, [row])[0];
      }
      case "prompt_history": {
        const [row] = await db
          .insert(promptHistory)
          .values({
            userId: values.userId as string,
            content: values.content as string,
            createdAt: (values.createdAt as Date | undefined) ?? now,
          })
          .returning();
        return serializeRows(tableKey, [row])[0];
      }
      case "tags": {
        const [row] = await db
          .insert(tags)
          .values({ name: values.name as string })
          .returning();
        return serializeRows(tableKey, [row])[0];
      }
      case "prompt_template_tags": {
        const [row] = await db
          .insert(promptTemplateTags)
          .values({
            templateId: values.templateId as string,
            tagId: values.tagId as string,
          })
          .returning();
        return serializeRows(tableKey, [row])[0];
      }
      case "prompt_template_likes": {
        const [row] = await db
          .insert(promptTemplateLikes)
          .values({
            userId: values.userId as string,
            templateId: values.templateId as string,
            createdAt: (values.createdAt as Date | undefined) ?? now,
          })
          .returning();
        return serializeRows(tableKey, [row])[0];
      }
      case "prompt_template_favorites": {
        const [row] = await db
          .insert(promptTemplateFavorites)
          .values({
            userId: values.userId as string,
            templateId: values.templateId as string,
            createdAt: (values.createdAt as Date | undefined) ?? now,
          })
          .returning();
        return serializeRows(tableKey, [row])[0];
      }
      case "accounts": {
        const [row] = await db
          .insert(accounts)
          .values({
            userId: values.userId as string,
            type: values.type as string,
            provider: values.provider as string,
            providerAccountId: values.providerAccountId as string,
            expires_at: (values.expires_at as number | null) ?? null,
            token_type: (values.token_type as string | null) ?? null,
            scope: (values.scope as string | null) ?? null,
            session_state: (values.session_state as string | null) ?? null,
          })
          .returning();
        return serializeRows(tableKey, [row])[0];
      }
      case "sessions": {
        const [row] = await db
          .insert(sessions)
          .values({
            sessionToken: values.sessionToken as string,
            userId: values.userId as string,
            expires: values.expires as Date,
          })
          .returning();
        return serializeRows(tableKey, [row])[0];
      }
      case "verification_tokens": {
        const [row] = await db
          .insert(verificationTokens)
          .values({
            identifier: values.identifier as string,
            token: values.token as string,
            expires: values.expires as Date,
          })
          .returning();
        return serializeRows(tableKey, [row])[0];
      }
      default:
        throw new Error("Unknown table");
    }
  } catch (err) {
    throw new Error(formatDbError(err));
  }
}

export async function updateAdminRow(
  tableKey: AdminTableKey,
  primaryKey: Record<string, unknown>,
  raw: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const values = validateUpdate(tableKey, raw);
  const where = pkWhere(tableKey, primaryKey);
  const now = new Date();

  try {
    switch (tableKey) {
      case "users": {
        const [row] = await db
          .update(users)
          .set({
            ...(values.name !== undefined ? { name: values.name as string | null } : {}),
            ...(values.email !== undefined ? { email: values.email as string | null } : {}),
            ...(values.emailVerified !== undefined
              ? { emailVerified: values.emailVerified as Date | null }
              : {}),
            ...(values.image !== undefined ? { image: values.image as string | null } : {}),
          })
          .where(where)
          .returning();
        if (!row) throw new Error("Row not found");
        return serializeRows(tableKey, [row])[0];
      }
      case "prompt_templates": {
        const patch: Partial<typeof promptTemplates.$inferInsert> = {
          updatedAt: now,
        };
        if (values.authorId !== undefined) patch.authorId = values.authorId as string;
        if (values.title !== undefined) patch.title = values.title as string | null;
        if (values.body !== undefined) {
          patch.body = values.body as string;
          if (values.title === undefined) patch.title = deriveTitle(values.body as string);
        }
        if (values.isPrivate !== undefined) patch.isPrivate = values.isPrivate as boolean;
        const [row] = await db
          .update(promptTemplates)
          .set(patch)
          .where(where)
          .returning();
        if (!row) throw new Error("Row not found");
        return serializeRows(tableKey, [row])[0];
      }
      case "prompt_history": {
        const [row] = await db
          .update(promptHistory)
          .set({
            ...(values.userId !== undefined ? { userId: values.userId as string } : {}),
            ...(values.content !== undefined ? { content: values.content as string } : {}),
            ...(values.createdAt !== undefined
              ? { createdAt: values.createdAt as Date }
              : {}),
          })
          .where(where)
          .returning();
        if (!row) throw new Error("Row not found");
        return serializeRows(tableKey, [row])[0];
      }
      case "tags": {
        const [row] = await db
          .update(tags)
          .set({
            ...(values.name !== undefined ? { name: values.name as string } : {}),
          })
          .where(where)
          .returning();
        if (!row) throw new Error("Row not found");
        return serializeRows(tableKey, [row])[0];
      }
      case "prompt_template_tags":
        throw new Error("Update not supported for junction table; delete and recreate");
      case "prompt_template_likes": {
        const [row] = await db
          .update(promptTemplateLikes)
          .set({
            ...(values.createdAt !== undefined
              ? { createdAt: values.createdAt as Date }
              : {}),
          })
          .where(where)
          .returning();
        if (!row) throw new Error("Row not found");
        return serializeRows(tableKey, [row])[0];
      }
      case "prompt_template_favorites": {
        const [row] = await db
          .update(promptTemplateFavorites)
          .set({
            ...(values.createdAt !== undefined
              ? { createdAt: values.createdAt as Date }
              : {}),
          })
          .where(where)
          .returning();
        if (!row) throw new Error("Row not found");
        return serializeRows(tableKey, [row])[0];
      }
      case "accounts": {
        const [row] = await db
          .update(accounts)
          .set({
            ...(values.userId !== undefined ? { userId: values.userId as string } : {}),
            ...(values.type !== undefined ? { type: values.type as string } : {}),
            ...(values.expires_at !== undefined
              ? { expires_at: values.expires_at as number | null }
              : {}),
            ...(values.token_type !== undefined
              ? { token_type: values.token_type as string | null }
              : {}),
            ...(values.scope !== undefined ? { scope: values.scope as string | null } : {}),
            ...(values.session_state !== undefined
              ? { session_state: values.session_state as string | null }
              : {}),
          })
          .where(where)
          .returning();
        if (!row) throw new Error("Row not found");
        return serializeRows(tableKey, [row])[0];
      }
      case "sessions": {
        const [row] = await db
          .update(sessions)
          .set({
            ...(values.userId !== undefined ? { userId: values.userId as string } : {}),
            ...(values.expires !== undefined ? { expires: values.expires as Date } : {}),
          })
          .where(where)
          .returning();
        if (!row) throw new Error("Row not found");
        return serializeRows(tableKey, [row])[0];
      }
      case "verification_tokens": {
        const [row] = await db
          .update(verificationTokens)
          .set({
            ...(values.expires !== undefined ? { expires: values.expires as Date } : {}),
          })
          .where(where)
          .returning();
        if (!row) throw new Error("Row not found");
        return serializeRows(tableKey, [row])[0];
      }
      default:
        throw new Error("Unknown table");
    }
  } catch (err) {
    throw new Error(formatDbError(err));
  }
}

export async function deleteAdminRow(
  tableKey: AdminTableKey,
  primaryKey: Record<string, unknown>,
): Promise<void> {
  const where = pkWhere(tableKey, primaryKey);
  try {
    switch (tableKey) {
      case "users":
        await db.delete(users).where(where);
        return;
      case "prompt_templates":
        await db.delete(promptTemplates).where(where);
        return;
      case "prompt_history":
        await db.delete(promptHistory).where(where);
        return;
      case "tags":
        await db.delete(tags).where(where);
        return;
      case "prompt_template_tags":
        await db.delete(promptTemplateTags).where(where);
        return;
      case "prompt_template_likes":
        await db.delete(promptTemplateLikes).where(where);
        return;
      case "prompt_template_favorites":
        await db.delete(promptTemplateFavorites).where(where);
        return;
      case "accounts":
        await db.delete(accounts).where(where);
        return;
      case "sessions":
        await db.delete(sessions).where(where);
        return;
      case "verification_tokens":
        await db.delete(verificationTokens).where(where);
        return;
      default:
        throw new Error("Unknown table");
    }
  } catch (err) {
    throw new Error(formatDbError(err));
  }
}

function formatDbError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes("foreign key")) {
      return "Foreign key constraint failed";
    }
    return err.message;
  }
  return "Database error";
}
