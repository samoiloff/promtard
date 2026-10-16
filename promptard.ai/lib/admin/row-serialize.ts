import type { AdminTableKey } from "@/lib/admin/table-registry";
import { ADMIN_TABLES } from "@/lib/admin/table-registry";

export type RowRecord = Record<string, unknown>;

function serializeValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  return value;
}

export function serializeRow(
  tableKey: AdminTableKey,
  row: RowRecord,
): RowRecord {
  const def = ADMIN_TABLES[tableKey];
  const out: RowRecord = {};
  for (const [key, value] of Object.entries(row)) {
    const col = def.columns.find((c) => c.key === key);
    if (col?.hidden) continue;
    out[key] = serializeValue(value);
  }
  return out;
}

export function serializeRows(
  tableKey: AdminTableKey,
  rows: RowRecord[],
): RowRecord[] {
  return rows.map((row) => serializeRow(tableKey, row));
}
