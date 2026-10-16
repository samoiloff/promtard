import { verifyAdminSessionToken } from "@/lib/admin/session-crypto";

function adminSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.AUTH_SECRET ??
    ""
  );
}

export async function isAdminRequestAuthorized(
  cookieValue: string | undefined,
): Promise<boolean> {
  if (!cookieValue) return false;
  const secret = adminSessionSecret();
  if (!secret) return false;
  return verifyAdminSessionToken(cookieValue, secret);
}
