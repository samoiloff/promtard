import { auth } from "@/auth";
import { listLikedPromptTemplatesForUser } from "@/lib/templates/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await listLikedPromptTemplatesForUser(session.user.id);
    return Response.json({ items });
  } catch (error) {
    console.error("GET /api/prompt-templates/liked", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Не удалось загрузить лайки",
      },
      { status: 500 },
    );
  }
}
