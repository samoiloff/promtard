"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminRowForm } from "@/components/admin/admin-row-form";
import type { AdminColumnDef, AdminTableKey } from "@/lib/admin/table-registry";

type TableMeta = {
  key: AdminTableKey;
  label: string;
  primaryKey: string[];
  columns: AdminColumnDef[];
};

type ListResponse = {
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  table: TableMeta;
  error?: string;
};

function cellPreview(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.length > 80) return `${s.slice(0, 77)}…`;
  return s;
}

function primaryKeyFromRow(
  row: Record<string, unknown>,
  primaryKey: string[],
): Record<string, unknown> {
  const pk: Record<string, unknown> = {};
  for (const key of primaryKey) {
    pk[key] = row[key];
  }
  return pk;
}

type AdminDataTabProps = {
  tableKey: AdminTableKey;
};

export function AdminDataTab({ tableKey }: AdminDataTabProps) {
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/tables/${tableKey}?page=${page}&limit=50`,
      );
      const json = (await response.json()) as ListResponse;
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to load");
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tableKey, page]);

  useEffect(() => {
    setPage(1);
  }, [tableKey]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(values: Record<string, unknown>) {
    const response = await fetch(`/api/admin/tables/${tableKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(json.error ?? "Create failed");
    await load();
  }

  async function handleUpdate(values: Record<string, unknown>) {
    if (!data || !editRow) return;
    const response = await fetch(`/api/admin/tables/${tableKey}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        primaryKey: primaryKeyFromRow(editRow, data.table.primaryKey),
        values,
      }),
    });
    const json = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(json.error ?? "Update failed");
    await load();
  }

  async function handleDelete(row: Record<string, unknown>) {
    if (!data) return;
    if (!window.confirm("Delete this row?")) return;
    const response = await fetch(`/api/admin/tables/${tableKey}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        primaryKey: primaryKeyFromRow(row, data.table.primaryKey),
      }),
    });
    const json = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(json.error ?? "Delete failed");
    await load();
  }

  const columns = data?.table.columns ?? [];
  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / data.limit))
    : 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {data?.table.label ?? tableKey}
          {data ? ` · ${data.total} rows` : ""}
        </p>
        <button
          type="button"
          onClick={() => {
            setFormMode("create");
            setEditRow({});
            setFormOpen(true);
          }}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add row
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : data ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[32rem] text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-2 py-2 font-medium">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-2 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="max-w-[12rem] truncate px-2 py-2 align-top"
                        title={cellPreview(row[col.key])}
                      >
                        {cellPreview(row[col.key])}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-2 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => {
                          setFormMode("edit");
                          setEditRow(row);
                          setFormOpen(true);
                        }}
                        className="mr-2 text-zinc-600 underline dark:text-zinc-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(row)}
                        className="text-red-600 underline dark:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-zinc-300 px-2 py-1 disabled:opacity-40 dark:border-zinc-600"
            >
              Prev
            </button>
            <span>
              Page {data.page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-zinc-300 px-2 py-1 disabled:opacity-40 dark:border-zinc-600"
            >
              Next
            </button>
          </div>
        </>
      ) : null}

      <AdminRowForm
        open={formOpen}
        mode={formMode}
        columns={columns}
        primaryKey={data?.table.primaryKey ?? []}
        initialValues={editRow ?? {}}
        onClose={() => setFormOpen(false)}
        onSubmit={formMode === "create" ? handleCreate : handleUpdate}
      />
    </div>
  );
}
