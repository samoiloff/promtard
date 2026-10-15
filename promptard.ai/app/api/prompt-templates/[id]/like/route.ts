import { auth } from "@/auth";
import {
  likePublicTemplate,
  unlikePublicTemplate,
} from "@/lib/templates/catalog-queries";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await likePublicTemplate(session.user.id, id);
  if (!result) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(result);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await unlikePublicTemplate(session.user.id, id);
  if (!result) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(result);
}
