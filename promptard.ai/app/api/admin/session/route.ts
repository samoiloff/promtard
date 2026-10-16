import { getAdminSessionFromCookies } from "@/lib/admin/auth";

export async function GET() {
  const authed = await getAdminSessionFromCookies();
  return Response.json({ authed });
}
