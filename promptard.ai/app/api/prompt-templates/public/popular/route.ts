import { auth } from "@/auth";
import { listPopularPublicTemplates } from "@/lib/templates/catalog-queries";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit"));

  try {
    const items = await listPopularPublicTemplates(userId, limit);
    return Response.json({ items });
  } catch (error) {
    console.error("GET /api/prompt-templates/public/popular", error);
    return Response.json(
      { error: "Не удалось загрузить шаблоны" },
      { status: 500 },
    );
  }
}
