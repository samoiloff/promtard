"use client";

import { useRef, useState } from "react";

type ImportError = { row: number; message: string };

type ImportResult = {
  total: number;
  created: number;
  failed: number;
  errors: ImportError[];
};

const buttonBase =
  "rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-40";

export function AdminImportTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  function handleChooseFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    setFile(next);
    setImportError(null);
    setImportResult(null);
  }

  async function handleImport() {
    if (!file || importLoading) return;
    setImportLoading(true);
    setImportError(null);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as ImportResult & { error?: string };
      if (!response.ok && !data.total && data.error) {
        throw new Error(data.error);
      }
      setImportResult(data);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImportLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        <p className="font-medium text-zinc-800 dark:text-zinc-200">
          Import prompt templates (CSV)
        </p>
        <p className="mt-2">
          Header row: <code className="text-xs">body,tags,is_public</code>
        </p>
        <p className="mt-1 text-xs">
          Templates are created under the system admin user. Tags are
          comma-separated in the cell.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleChooseFile}
            disabled={importLoading}
            className={`${buttonBase} border border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-900`}
          >
            Choose File
          </button>
          <button
            type="button"
            onClick={() => void handleImport()}
            disabled={importLoading || !file}
            className={`${buttonBase} bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900`}
          >
            {importLoading ? "Importing…" : "Import"}
          </button>
        </div>

        {file ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Selected: <span className="font-medium text-zinc-800 dark:text-zinc-200">{file.name}</span>
          </p>
        ) : (
          <p className="text-sm text-zinc-500">No file selected.</p>
        )}

        {importError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>
        ) : null}
      </div>

      {importResult ? (
        <div className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <p>
            Total rows: {importResult.total} · Created: {importResult.created} ·
            Failed: {importResult.failed}
          </p>
          {importResult.errors.length > 0 ? (
            <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-xs text-red-600 dark:text-red-400">
              {importResult.errors.map((err) => (
                <li key={`${err.row}-${err.message}`}>
                  Row {err.row}: {err.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
