import { cookies } from "next/headers";

import {
  adminSessionCookieOptions,
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin/auth";

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return Response.json(
      { error: "Admin login is not configured" },
      { status: 503 },
    );
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password = body.password ?? "";
  if (!verifyAdminPassword(password)) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  try {
    const token = await createAdminSessionToken();
    const cookieStore = await cookies();
    cookieStore.set(adminSessionCookieOptions(token));
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Session configuration error" },
      { status: 503 },
    );
  }
}
