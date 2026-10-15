import { auth } from "@/auth";
import { createHistoryBodySchema } from "@/lib/history/validation";
import {
  createPromptHistoryForUser,
  listPromptHistoryForUser,
} from "@/lib/history/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await listPromptHistoryForUser(session.user.id);
  return Response.json({ items });
}

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

  const parsed = createHistoryBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  const item = await createPromptHistoryForUser(
    session.user.id,
    parsed.data.content,
  );
  return Response.json({ item }, { status: 201 });
}
