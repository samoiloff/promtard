"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { TemplateEditor } from "@/components/templates/template-editor";
import { fetchJson } from "@/lib/api/read-json-response";
import type { PromptTemplateViewItem } from "@/lib/templates/types";

export function EditTemplateLoader({ templateId }: { templateId: string }) {
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
        if (!cancelled && data.item) {
          if (!data.item.canEdit) {
            router.replace(`/templates/${templateId}`);
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

  return (
    <TemplateEditor
      mode="edit"
      templateId={item.id}
      initialBody={item.body}
      initialTags={item.tags}
      initialIsPublic={item.isPublic}
    />
  );
}
