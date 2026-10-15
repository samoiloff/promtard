import { auth } from "@/auth";
import { mergeLocalHistoryForUser } from "@/lib/history/server";
import { mergeBodySchema } from "@/lib/history/validation";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = mergeBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  const merged = await mergeLocalHistoryForUser(
    session.user.id,
    parsed.data.items,
  );
  return Response.json({ merged });
}
