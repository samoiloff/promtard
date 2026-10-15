"use client";

import { useRouter } from "next/navigation";

import type { ChatMessage } from "@/contexts/chat-context";
import { FolderImportIcon } from "@/components/icons/folder-import-icon";
import { TEMPLATE_DRAFT_BODY_KEY } from "@/lib/templates/constants";

type ChatMessageListProps = {
  messages: ChatMessage[];
};

export function ChatMessageList({ messages }: ChatMessageListProps) {
  const router = useRouter();

  function openTemplateEditor(content: string) {
    sessionStorage.setItem(TEMPLATE_DRAFT_BODY_KEY, content);
    router.push("/templates/new");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={
            message.role === "user"
              ? "flex flex-col items-end gap-2"
              : "flex flex-col items-start gap-1"
          }
        >
          {message.role === "user" ? (
            <div className="flex max-w-[85%] flex-row items-end gap-2 sm:max-w-[75%]">
              <button
                type="button"
                onClick={() => openTemplateEditor(message.content)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <FolderImportIcon className="shrink-0" />
                <span className="hidden sm:inline">Create template</span>
                <span className="sm:hidden">Template</span>
              </button>
              <div
                className="min-w-0 rounded-2xl rounded-br-md bg-zinc-900 px-4 py-3 text-sm leading-relaxed text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ) : (
            <div className="max-w-full text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
              {message.content ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <span className="text-zinc-400">…</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
