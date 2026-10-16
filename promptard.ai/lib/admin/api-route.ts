import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";

export async function withAdminAuth<T>(
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    await requireAdminSession();
    return await handler();
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}

export function adminErrorResponse(err: unknown, status = 400): Response {
  const message = err instanceof Error ? err.message : "Request failed";
  return Response.json({ error: message }, { status });
}
