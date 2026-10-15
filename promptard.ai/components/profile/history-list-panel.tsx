"use client";

import { useRouter } from "next/navigation";

import { SaveIcon } from "@/components/icons/save-icon";
import { usePromptComposer } from "@/contexts/prompt-composer-context";
import { usePromptHistoryContext } from "@/contexts/prompt-history-context";
import { useTemplateActions } from "@/hooks/use-template-actions";

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function truncate(text: string, max = 200) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function HistoryListPanel() {
  const router = useRouter();
  const { items, loading, error } = usePromptHistoryContext();
  const { applyFromHistory } = usePromptComposer();
  const { openNewTemplateFromDraft } = useTemplateActions();

  function openInChat(content: string) {
    applyFromHistory(content);
    router.push("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold tracking-tight">Prompt history</h1>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Nothing yet. Send your first prompt in chat.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-stretch overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              <button
                type="button"
                onClick={() => openInChat(item.content)}
                className="min-w-0 flex-1 px-4 py-3 text-left"
              >
                <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {truncate(item.content)}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  {formatWhen(item.createdAt)}
                </p>
              </button>
              <button
                type="button"
                onClick={() => openNewTemplateFromDraft(item.content)}
                className="flex shrink-0 items-center justify-center border-l border-zinc-200 px-3 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                aria-label="Save as template"
              >
                <SaveIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
