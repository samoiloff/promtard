"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import { usePromptComposer } from "@/contexts/prompt-composer-context";
import { usePromptHistoryContext } from "@/contexts/prompt-history-context";
import { PROMPT_HISTORY_SIDEBAR_LIMIT } from "@/lib/history/constants";

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

function truncate(text: string, max = 72) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function PromptHistorySidebar() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const { items, loading, error } = usePromptHistoryContext();
  const { applyFromHistory } = usePromptComposer();
  const recentItems = items.slice(0, PROMPT_HISTORY_SIDEBAR_LIMIT);

  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          History
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Recent prompts ({PROMPT_HISTORY_SIDEBAR_LIMIT})
        </p>
        {isAuthenticated ? (
          <Link
            href="/profile/history"
            className="mt-2 inline-block text-xs font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            Full history
          </Link>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-2">
        {loading ? (
          <p className="px-2 py-3 text-sm text-zinc-500">Loading…</p>
        ) : error ? (
          <p className="px-2 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : recentItems.length === 0 ? (
          <p className="px-2 py-3 text-sm text-zinc-500 dark:text-zinc-400">
            Nothing yet. Send your first prompt.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {recentItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => applyFromHistory(item.content)}
                  className="w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80"
                >
                  <p className="text-sm leading-snug text-zinc-800 dark:text-zinc-200">
                    {truncate(item.content)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                    {formatWhen(item.createdAt)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
