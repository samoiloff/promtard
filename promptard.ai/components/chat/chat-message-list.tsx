"use client";

import type { ChatMessage } from "@/contexts/chat-context";
import { showToast } from "@/components/chat/toast";

type ChatMessageListProps = {
  messages: ChatMessage[];
};

export function ChatMessageList({ messages }: ChatMessageListProps) {
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
            <div className="flex max-w-[85%] flex-col items-end gap-2 sm:max-w-[75%]">
              <div
                className="rounded-2xl rounded-br-md bg-zinc-900 px-4 py-3 text-sm leading-relaxed text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  showToast("Template editor coming soon")
                }
                className="text-xs font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Save To Template
              </button>
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
