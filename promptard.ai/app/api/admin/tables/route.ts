import { withAdminAuth } from "@/lib/admin/api-route";
import {
  ADMIN_TABLES,
  listAdminTablesForApi,
  type AdminTableKey,
} from "@/lib/admin/table-registry";

export async function GET() {
  return withAdminAuth(async () => {
    const tables = listAdminTablesForApi().map((t) => ({
      ...t,
      primaryKey: ADMIN_TABLES[t.key].primaryKey,
      columns: ADMIN_TABLES[t.key].columns.filter((c) => !c.hidden),
    }));
    return Response.json({ tables });
  });
}
