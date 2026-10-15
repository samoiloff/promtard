import { auth } from "@/auth";
import { updateTemplateBodySchema } from "@/lib/templates/validation";
import {
  deletePromptTemplateForUser,
  getPromptTemplateForViewer,
  updatePromptTemplateForUser,
} from "@/lib/templates/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const item = await getPromptTemplateForViewer(session.user.id, id);
  if (!item) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ item });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateTemplateBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  const item = await updatePromptTemplateForUser(
    session.user.id,
    id,
    parsed.data.body,
    parsed.data.tags,
  );

  if (!item) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ item });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deletePromptTemplateForUser(session.user.id, id);
  if (!deleted) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
