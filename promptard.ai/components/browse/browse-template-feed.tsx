"use client";

import { useEffect, useState } from "react";

import { PublicTemplateList } from "@/components/browse/public-template-list";
import { fetchJson } from "@/lib/api/read-json-response";
import type { PublicTemplateListItem } from "@/lib/templates/types";

type BrowseTemplateFeedProps = {
  title: string;
  emptyMessage: string;
  endpoint: string;
};

export function BrowseTemplateFeed({
  title,
  emptyMessage,
  endpoint,
}: BrowseTemplateFeedProps) {
  const [items, setItems] = useState<PublicTemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { response, data } = await fetchJson<{
          items?: PublicTemplateListItem[];
          error?: string;
        }>(endpoint);
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load");
        }
        if (!cancelled) setItems(data.items ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Load failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : (
        <PublicTemplateList
          items={items}
          emptyMessage={emptyMessage}
          onItemsChange={setItems}
        />
      )}
    </div>
  );
}
