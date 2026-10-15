import { auth } from "@/auth";
import { listRecentPublicTemplates } from "@/lib/templates/catalog-queries";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit"));

  try {
    const items = await listRecentPublicTemplates(userId, limit);
    return Response.json({ items });
  } catch (error) {
    console.error("GET /api/prompt-templates/public/recent", error);
    return Response.json(
      { error: "Failed to load templates" },
      { status: 500 },
    );
  }
}
