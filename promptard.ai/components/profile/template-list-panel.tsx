"use client";

import Link from "next/link";

import { PencilIcon } from "@/components/icons/pencil-icon";
import { useTemplateActions } from "@/hooks/use-template-actions";
import type { PromptTemplateListItem } from "@/lib/templates/types";

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

type TemplateListPanelProps = {
  title: string;
  emptyMessage: string;
  items: PromptTemplateListItem[];
  loading: boolean;
  error: string | null;
  showAuthor?: boolean;
  showCreateButton?: boolean;
};

export function TemplateListPanel({
  title,
  emptyMessage,
  items,
  loading,
  error,
  showAuthor = false,
  showCreateButton = false,
}: TemplateListPanelProps) {
  const { openEditor, openNewTemplate } = useTemplateActions();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {showCreateButton ? (
          <button
            type="button"
            onClick={openNewTemplate}
            className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Create template
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              <Link
                href={`/?template=${item.id}`}
                className="min-w-0 flex-1 px-4 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {item.title ?? item.bodyPreview}
                </p>
                {item.title ? (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {item.bodyPreview}
                  </p>
                ) : null}
                {showAuthor && item.authorName ? (
                  <p className="mt-1 text-xs text-zinc-500">
                    Author: {item.authorName}
                  </p>
                ) : null}
                {item.tags.length > 0 ? (
                  <p className="mt-2 text-xs text-zinc-500">
                    {item.tags.join(" · ")}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-zinc-400">
                  {formatWhen(item.updatedAt)}
                </p>
              </Link>
              <button
                type="button"
                onClick={() => void openEditor(item.id, item.canEdit)}
                className="flex shrink-0 flex-col items-center justify-center gap-1 border-l border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                aria-label="Edit template"
              >
                <PencilIcon />
                <span>edit</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
