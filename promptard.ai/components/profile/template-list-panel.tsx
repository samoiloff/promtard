"use client";

import Link from "next/link";

import { PencilIcon } from "@/components/icons/pencil-icon";
import { TemplateCardSideAction } from "@/components/templates/template-card-side-action";
import { TemplateCardTags } from "@/components/templates/template-card-tags";
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
  const { openEditor, openInChat, openNewTemplate } = useTemplateActions();

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
              <div className="min-w-0 flex-1 px-4 py-3">
                <Link
                  href={`/templates/${item.id}`}
                  className="block transition hover:opacity-80"
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
                </Link>
                <TemplateCardTags tags={item.tags} />
                <p className="mt-2 text-xs text-zinc-400">
                  {formatWhen(item.updatedAt)}
                </p>
              </div>
              <TemplateCardSideAction
                label="Run"
                onClick={() => openInChat(item.id)}
                ariaLabel="Run template"
              />
              <TemplateCardSideAction
                label="edit"
                onClick={() => void openEditor(item.id, item.canEdit)}
                ariaLabel="Edit template"
                icon={<PencilIcon />}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
