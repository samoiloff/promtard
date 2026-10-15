"use client";

import { useEffect, useState } from "react";

import { PublicTemplateList } from "@/components/browse/public-template-list";
import { fetchJson } from "@/lib/api/read-json-response";
import type { PublicTemplateListItem } from "@/lib/templates/types";

export default function BrowseSearchPage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [items, setItems] = useState<PublicTemplateListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debounced) return;

    let cancelled = false;
    async function search() {
      setLoading(true);
      setError(null);
      try {
        const { response, data } = await fetchJson<{
          items?: PublicTemplateListItem[];
          error?: string;
        }>(
          `/api/prompt-templates/public/search?q=${encodeURIComponent(debounced)}`,
        );
        if (!response.ok) {
          throw new Error(data.error ?? "Не удалось выполнить поиск");
        }
        if (!cancelled) setItems(data.items ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Ошибка поиска");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void search();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold tracking-tight">Поиск шаблонов</h1>
      <label className="flex flex-col gap-2">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          По названию или тегу
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введите запрос…"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      {loading ? (
        <p className="text-sm text-zinc-500">Поиск…</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : debounced ? (
        <PublicTemplateList
          items={items}
          emptyMessage="Ничего не найдено."
          onItemsChange={setItems}
        />
      ) : (
        <p className="text-sm text-zinc-500">Введите слово для поиска.</p>
      )}
    </div>
  );
}
