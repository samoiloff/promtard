"use client";

import { useRouter } from "next/navigation";

import { FolderImportIcon } from "@/components/icons/folder-import-icon";
import { usePromptComposer } from "@/contexts/prompt-composer-context";
import { usePromptHistoryContext } from "@/contexts/prompt-history-context";
import { TEMPLATE_DRAFT_BODY_KEY } from "@/lib/templates/constants";

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

  function openInChat(content: string) {
    applyFromHistory(content);
    router.push("/");
  }

  function createTemplate(content: string) {
    sessionStorage.setItem(TEMPLATE_DRAFT_BODY_KEY, content);
    router.push("/templates/new");
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
              className="rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800"
            >
              <button
                type="button"
                onClick={() => openInChat(item.content)}
                className="w-full text-left"
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
                onClick={() => createTemplate(item.content)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                <FolderImportIcon className="shrink-0" />
                Create template
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
