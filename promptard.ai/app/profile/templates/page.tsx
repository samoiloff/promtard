"use client";

import { useEffect, useState } from "react";

import { TemplateListPanel } from "@/components/profile/template-list-panel";
import { fetchJson } from "@/lib/api/read-json-response";
import type { PromptTemplateListItem } from "@/lib/templates/types";

export default function ProfileTemplatesPage() {
  const [items, setItems] = useState<PromptTemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { response, data } = await fetchJson<{
          items?: PromptTemplateListItem[];
          error?: string;
        }>("/api/prompt-templates/mine");
        if (!response.ok) {
          throw new Error(data.error ?? "Не удалось загрузить шаблоны");
        }
        if (!cancelled) setItems(data.items ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Ошибка загрузки");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TemplateListPanel
      title="Мои шаблоны"
      emptyMessage="Вы ещё не создали шаблонов."
      items={items}
      loading={loading}
      error={error}
      showCreateButton
    />
  );
}
