"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { TemplateView } from "@/components/templates/template-view";
import { fetchJson } from "@/lib/api/read-json-response";
import type { PromptTemplateViewItem } from "@/lib/templates/types";

export function TemplateViewLoader({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [item, setItem] = useState<PromptTemplateViewItem | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const { response, data } = await fetchJson<{
          item?: PromptTemplateViewItem;
          error?: string;
        }>(`/api/prompt-templates/${templateId}`);
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load template");
        }
        if (!data.item) {
          throw new Error("Template not found");
        }
        if (!cancelled) {
          if (data.item.canEdit) {
            router.replace(`/templates/${templateId}/edit`);
            return;
          }
          setItem(data.item);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Load failed",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [templateId, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  if (loadError || !item) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-sm text-zinc-500">
        <p>{loadError ?? "Template not found"}</p>
      </div>
    );
  }

  return <TemplateView item={item} />;
}
