import { ensureSystemAdminUser } from "@/lib/admin/ensure-system-user";
import { parseTemplatesCsv } from "@/lib/admin/csv-import";
import { requireAdminSession, AdminAuthError } from "@/lib/admin/auth";
import { createPromptTemplatesBulk } from "@/lib/templates/server";

export async function POST(request: Request) {
  try {
    await requireAdminSession();
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file field" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = parseTemplatesCsv(buffer);

  if (!parsed.ok) {
    return Response.json(
      {
        total: 0,
        created: 0,
        failed: parsed.errors.length,
        errors: parsed.errors,
      },
      { status: 400 },
    );
  }

  const authorId = await ensureSystemAdminUser();

  const validationErrors = parsed.errors;
  const runtimeErrors: { row: number; message: string }[] = [];
  let created = 0;

  try {
    created = await createPromptTemplatesBulk(authorId, parsed.rows);
  } catch (err) {
    runtimeErrors.push({
      row: 0,
      message: err instanceof Error ? err.message : "Import failed",
    });
  }

  const allErrors = [...validationErrors, ...runtimeErrors];
  const total = parsed.rows.length + validationErrors.length;
  const failed = validationErrors.length + parsed.rows.length - created;

  return Response.json({
    total,
    created,
    failed,
    errors: allErrors,
  });
}
