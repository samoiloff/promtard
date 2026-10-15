import { auth } from "@/auth";
import { searchPublicTemplates } from "@/lib/templates/catalog-queries";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limit = Number(searchParams.get("limit"));

  if (!q.trim()) {
    return Response.json({ items: [] });
  }

  try {
    const items = await searchPublicTemplates(userId, q, limit);
    return Response.json({ items });
  } catch (error) {
    console.error("GET /api/prompt-templates/public/search", error);
    return Response.json(
      { error: "Не удалось выполнить поиск" },
      { status: 500 },
    );
  }
}
