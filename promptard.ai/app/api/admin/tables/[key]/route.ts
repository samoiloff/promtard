import { adminErrorResponse, withAdminAuth } from "@/lib/admin/api-route";
import {
  ADMIN_TABLES,
  getAdminTable,
  type AdminTableKey,
} from "@/lib/admin/table-registry";
import {
  createAdminRow,
  deleteAdminRow,
  listAdminRows,
  updateAdminRow,
} from "@/lib/admin/table-crud";

type RouteContext = { params: Promise<{ key: string }> };

function resolveKey(key: string): AdminTableKey | null {
  const def = getAdminTable(key);
  return def?.key ?? null;
}

export async function GET(request: Request, context: RouteContext) {
  return withAdminAuth(async () => {
    const { key } = await context.params;
    const tableKey = resolveKey(key);
    if (!tableKey) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "50");

    const result = await listAdminRows(tableKey, page, limit);
    const def = ADMIN_TABLES[tableKey];
    return Response.json({
      ...result,
      table: {
        key: def.key,
        label: def.label,
        primaryKey: def.primaryKey,
        columns: def.columns.filter((c) => !c.hidden),
      },
    });
  });
}

export async function POST(request: Request, context: RouteContext) {
  return withAdminAuth(async () => {
    const { key } = await context.params;
    const tableKey = resolveKey(key);
    if (!tableKey) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    try {
      const row = await createAdminRow(tableKey, body);
      return Response.json({ row }, { status: 201 });
    } catch (err) {
      return adminErrorResponse(err);
    }
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withAdminAuth(async () => {
    const { key } = await context.params;
    const tableKey = resolveKey(key);
    if (!tableKey) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    let body: { primaryKey?: Record<string, unknown>; values?: Record<string, unknown> };
    try {
      body = (await request.json()) as {
        primaryKey?: Record<string, unknown>;
        values?: Record<string, unknown>;
      };
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body.primaryKey || !body.values) {
      return Response.json(
        { error: "primaryKey and values required" },
        { status: 400 },
      );
    }

    try {
      const row = await updateAdminRow(tableKey, body.primaryKey, body.values);
      return Response.json({ row });
    } catch (err) {
      return adminErrorResponse(err);
    }
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return withAdminAuth(async () => {
    const { key } = await context.params;
    const tableKey = resolveKey(key);
    if (!tableKey) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    let body: { primaryKey?: Record<string, unknown> };
    try {
      body = (await request.json()) as { primaryKey?: Record<string, unknown> };
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body.primaryKey) {
      return Response.json({ error: "primaryKey required" }, { status: 400 });
    }

    try {
      await deleteAdminRow(tableKey, body.primaryKey);
      return Response.json({ ok: true });
    } catch (err) {
      return adminErrorResponse(err);
    }
  });
}
