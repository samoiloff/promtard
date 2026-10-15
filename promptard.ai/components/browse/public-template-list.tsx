"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSession } from "next-auth/react";

import { LoginModal } from "@/components/auth/login-modal";
import { HeartIcon } from "@/components/icons/heart-icon";
import { fetchJson } from "@/lib/api/read-json-response";
import type { PublicTemplateListItem } from "@/lib/templates/types";

function formatCreated(iso: string) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
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
        throw new Error(data.error ?? "Не удалось обновить лайк");
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
            className="flex gap-3 rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800"
          >
            <Link href={`/templates/${item.id}`} className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {item.title ?? "Без названия"}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {item.bodyPreview}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                {item.authorName ?? "Автор"} · {formatCreated(item.createdAt)}
              </p>
            </Link>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => void toggleLike(item)}
                className={
                  item.likedByMe
                    ? "rounded-full p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                    : "rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-900"
                }
                aria-label={item.likedByMe ? "Убрать лайк" : "Лайкнуть"}
              >
                <HeartIcon filled={item.likedByMe} />
              </button>
              <span className="text-xs tabular-nums text-zinc-500">
                {item.likeCount}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <Suspense fallback={null}>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </Suspense>
    </>
  );
}
