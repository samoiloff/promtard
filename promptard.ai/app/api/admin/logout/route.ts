import { cookies } from "next/headers";

import { clearAdminSessionCookieOptions } from "@/lib/admin/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(clearAdminSessionCookieOptions());
  return Response.json({ ok: true });
}
