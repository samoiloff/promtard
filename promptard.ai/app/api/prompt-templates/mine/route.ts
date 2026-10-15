import { auth } from "@/auth";
import { listPromptTemplatesForAuthor } from "@/lib/templates/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await listPromptTemplatesForAuthor(session.user.id);
    return Response.json({ items });
  } catch (error) {
    console.error("GET /api/prompt-templates/mine", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Не удалось загрузить шаблоны",
      },
      { status: 500 },
    );
  }
}
