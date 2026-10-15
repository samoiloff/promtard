"use client";

import { useRouter } from "next/navigation";

import { fetchJson } from "@/lib/api/read-json-response";
import { TEMPLATE_DRAFT_BODY_KEY } from "@/lib/templates/constants";
import type { PromptTemplateViewItem } from "@/lib/templates/types";

export function useTemplateActions() {
  const router = useRouter();

  function openInChat(templateId: string) {
    router.push(`/?template=${templateId}`);
  }

  async function openEditor(
    templateId: string,
    canEdit: boolean,
    forkBody?: string,
  ) {
    if (canEdit) {
      router.push(`/templates/${templateId}/edit`);
      return;
    }

    if (forkBody !== undefined) {
      sessionStorage.setItem(TEMPLATE_DRAFT_BODY_KEY, forkBody);
      router.push("/templates/new");
      return;
    }

    const { response, data } = await fetchJson<{
      item?: PromptTemplateViewItem;
    }>(`/api/prompt-templates/${templateId}`);
    if (!response.ok || !data.item) return;

    sessionStorage.setItem(TEMPLATE_DRAFT_BODY_KEY, data.item.body);
    router.push("/templates/new");
  }

  function openNewTemplate() {
    sessionStorage.removeItem(TEMPLATE_DRAFT_BODY_KEY);
    router.push("/templates/new");
  }

  return { openInChat, openEditor, openNewTemplate };
}
