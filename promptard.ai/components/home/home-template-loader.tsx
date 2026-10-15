"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { usePromptComposer } from "@/contexts/prompt-composer-context";
import { fetchJson } from "@/lib/api/read-json-response";
import type { PromptTemplateViewItem } from "@/lib/templates/types";

export function HomeTemplateLoader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loadTemplateForHome } = usePromptComposer();

  const templateId = searchParams.get("template");

  useEffect(() => {
    if (!templateId) return;

    let cancelled = false;
    async function load() {
      try {
        const { response, data } = await fetchJson<{
          item?: PromptTemplateViewItem;
        }>(`/api/prompt-templates/${templateId}`);
        if (cancelled || !response.ok || !data.item) return;
        loadTemplateForHome(
          data.item.id,
          data.item.body,
          data.item.canEdit,
        );
        router.replace("/", { scroll: false });
      } catch {
        // ignore
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [templateId, loadTemplateForHome, router]);

  return null;
}
