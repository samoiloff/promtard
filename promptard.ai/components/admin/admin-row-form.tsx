"use client";

import { useEffect, useMemo, useState } from "react";

import type { AdminColumnDef } from "@/lib/admin/table-registry";

type AdminRowFormProps = {
  open: boolean;
  mode: "create" | "edit";
  columns: AdminColumnDef[];
  primaryKey: string[];
  initialValues: Record<string, unknown>;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
};

function inputValue(value: unknown, type: AdminColumnDef["type"]): string {
  if (value === null || value === undefined) return "";
  if (type === "boolean") return value ? "true" : "false";
  if (type === "datetime" && typeof value === "string") {
    try {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) {
        return d.toISOString().slice(0, 16);
      }
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function parseField(
  raw: string,
  col: AdminColumnDef,
): unknown {
  if (col.type === "boolean") return raw === "true";
  if (col.type === "integer") {
    if (!raw.trim()) return null;
    return Number.parseInt(raw, 10);
  }
  if (col.type === "datetime") {
    if (!raw.trim()) return null;
    return new Date(raw).toISOString();
  }
  if (!raw.trim()) return null;
  return raw;
}

export function AdminRowForm({
  open,
  mode,
  columns,
  primaryKey,
  initialValues,
  onClose,
  onSubmit,
}: AdminRowFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editableColumns = useMemo(
    () =>
      columns.filter((c) => {
        if (c.hidden) return false;
        if (mode === "edit" && primaryKey.includes(c.key)) return false;
        if (mode === "create" && c.readOnly && c.key !== "id") return false;
        if (mode === "edit" && c.readOnly) return false;
        return true;
      }),
    [columns, mode, primaryKey],
  );

  useEffect(() => {
    if (!open) return;
    const next: Record<string, string> = {};
    for (const col of editableColumns) {
      next[col.key] = inputValue(initialValues[col.key], col.type);
    }
    setValues(next);
    setError(null);
  }, [open, initialValues, editableColumns]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {};
      for (const col of editableColumns) {
        const parsed = parseField(values[col.key] ?? "", col);
        if (parsed !== null && parsed !== undefined && parsed !== "") {
          payload[col.key] = parsed;
        } else if (col.required && mode === "create") {
          throw new Error(`${col.label} is required`);
        }
      }
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-sm font-semibold">
          {mode === "create" ? "Add row" : "Edit row"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          {editableColumns.map((col) => (
            <label key={col.key} className="flex flex-col gap-1 text-xs">
              <span className="text-zinc-600 dark:text-zinc-400">
                {col.label}
                {col.required && mode === "create" ? " *" : ""}
              </span>
              {col.type === "boolean" ? (
                <select
                  value={values[col.key] ?? "false"}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [col.key]: e.target.value }))
                  }
                  className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="false">false</option>
                  <option value="true">true</option>
                </select>
              ) : col.type === "datetime" ? (
                <input
                  type="datetime-local"
                  value={values[col.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [col.key]: e.target.value }))
                  }
                  className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
                />
              ) : (
                <input
                  type={col.type === "integer" ? "number" : "text"}
                  value={values[col.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [col.key]: e.target.value }))
                  }
                  className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
                />
              )}
            </label>
          ))}
          {error ? (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          ) : null}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
