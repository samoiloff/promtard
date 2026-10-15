import { auth } from "@/auth";
import { createTemplateBodySchema } from "@/lib/templates/validation";
import { createPromptTemplateForUser } from "@/lib/templates/server";

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

  const parsed = createTemplateBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  const item = await createPromptTemplateForUser(
    session.user.id,
    parsed.data.body,
    parsed.data.tags,
    parsed.data.isPublic,
  );

  return Response.json({ item }, { status: 201 });
}
