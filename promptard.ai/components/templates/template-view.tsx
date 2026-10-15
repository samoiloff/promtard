"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { FolderImportIcon } from "@/components/icons/folder-import-icon";
import { TEMPLATE_DRAFT_BODY_KEY } from "@/lib/templates/constants";
import type { PromptTemplateViewItem } from "@/lib/templates/types";

type TemplateViewProps = {
  item: PromptTemplateViewItem;
};

export function TemplateView({ item }: TemplateViewProps) {
  const router = useRouter();

  function forkTemplate() {
    sessionStorage.setItem(TEMPLATE_DRAFT_BODY_KEY, item.body);
    router.push("/templates/new");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-lg font-semibold tracking-tight">
            {item.title ?? "Шаблон"}
          </h1>
          <Link
            href="/browse/recent"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            Назад
          </Link>
        </div>

        {item.tags.length > 0 ? (
          <p className="text-sm text-zinc-500">{item.tags.join(" · ")}</p>
        ) : null}

        <div
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        >
          {item.body}
        </div>

        <div className="flex flex-wrap gap-3 pb-6">
          <button
            type="button"
            onClick={forkTemplate}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            <FolderImportIcon />
            Создать свой шаблон на основе этого
          </button>
          {item.canEdit ? (
            <Link
              href={`/templates/${item.id}/edit`}
              className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
            >
              Редактировать
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
