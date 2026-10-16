import { eq } from "drizzle-orm";

import { ADMIN_SYSTEM_USER_ID } from "@/lib/admin/constants";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const SYSTEM_EMAIL = "admin@internal.promptard";
const SYSTEM_NAME = "Promptard Admin";

export async function ensureSystemAdminUser(): Promise<string> {
  const configuredId = process.env.ADMIN_SYSTEM_USER_ID ?? ADMIN_SYSTEM_USER_ID;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, configuredId))
    .limit(1);

  if (existing) return existing.id;

  await db
    .insert(users)
    .values({
      id: configuredId,
      name: SYSTEM_NAME,
      email: SYSTEM_EMAIL,
    })
    .onConflictDoNothing({ target: users.id });

  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, configuredId))
    .limit(1);

  if (!row) {
    throw new Error("Failed to ensure system admin user");
  }

  return row.id;
}
