"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSession } from "next-auth/react";

import { LoginModal } from "@/components/auth/login-modal";
import { HeartIcon } from "@/components/icons/heart-icon";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { fetchJson } from "@/lib/api/read-json-response";
import { useTemplateActions } from "@/hooks/use-template-actions";
import type { PublicTemplateListItem } from "@/lib/templates/types";

function formatCreated(iso: string) {
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

type PublicTemplateListProps = {
  items: PublicTemplateListItem[];
  emptyMessage: string;
  onItemsChange: (items: PublicTemplateListItem[]) => void;
};

export function PublicTemplateList({
  items,
  emptyMessage,
  onItemsChange,
}: PublicTemplateListProps) {
  const { data: session } = useSession();
  const { openEditor } = useTemplateActions();
  const [loginOpen, setLoginOpen] = useState(false);

  async function toggleLike(item: PublicTemplateListItem) {
    if (!session?.user) {
      setLoginOpen(true);
      return;
    }

    const method = item.likedByMe ? "DELETE" : "POST";
    try {
      const { response, data } = await fetchJson<{
        likeCount: number;
        likedByMe: boolean;
        error?: string;
      }>(`/api/prompt-templates/${item.id}/like`, { method });
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update like");
      }
      onItemsChange(
        items.map((row) =>
          row.id === item.id
            ? {
                ...row,
                likeCount: data.likeCount,
                likedByMe: data.likedByMe,
              }
            : row,
        ),
      );
    } catch {
      // ignore for now
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex gap-0 rounded-xl border border-zinc-200 dark:border-zinc-800"
          >
            <Link
              href={`/?template=${item.id}`}
              className="min-w-0 flex-1 px-4 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {item.title ?? "Untitled"}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {item.bodyPreview}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                {item.authorName ?? "Author"} · {formatCreated(item.createdAt)}
              </p>
            </Link>
            <div className="flex shrink-0 flex-col items-center justify-center gap-1 border-l border-zinc-200 px-3 py-2 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => void toggleLike(item)}
                className={
                  item.likedByMe
                    ? "rounded-full p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                    : "rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-900"
                }
                aria-label={item.likedByMe ? "Unlike" : "Like"}
              >
                <HeartIcon filled={item.likedByMe} />
              </button>
              <span className="text-xs tabular-nums text-zinc-500">
                {item.likeCount}
              </span>
            </div>
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
      <Suspense fallback={null}>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </Suspense>
    </>
  );
}
