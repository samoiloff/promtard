"use client";

import { FormEvent, useEffect, useRef } from "react";

import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ModelSelect } from "@/components/chat/model-select";
import { useChat } from "@/contexts/chat-context";
import { usePromptComposer } from "@/contexts/prompt-composer-context";

export function ChatPanel() {
  const { draft, setDraft } = usePromptComposer();
  const {
    messages,
    selectedModelId,
    setSelectedModelId,
    isStreaming,
    error,
    sendMessage,
    clearError,
  } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isStreaming) return;
    setDraft("");
    clearError();
    await sendMessage(content);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="flex h-full flex-col items-center justify-center px-4 py-10">
            <h1 className="text-center text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              Чем могу помочь?
            </h1>
            <p className="mt-3 max-w-md text-center text-sm text-zinc-500 dark:text-zinc-400">
              Задайте вопрос или опишите задачу. Ответ придёт от выбранной модели
              Groq.
            </p>
          </div>
        ) : (
          <ChatMessageList messages={messages} />
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={3}
            disabled={isStreaming}
            placeholder="Напишите промпт…"
            className="w-full resize-none bg-transparent px-2 py-2 text-base text-zinc-900 outline-none placeholder:text-zinc-400 disabled:opacity-60 dark:text-zinc-100"
          />
          <div className="mt-2 flex items-center justify-between gap-3 px-1 pb-1">
            <ModelSelect
              value={selectedModelId}
              onChange={setSelectedModelId}
              disabled={isStreaming}
            />
            <div className="flex items-center gap-3">
              {error ? (
                <p className="max-w-[12rem] truncate text-xs text-red-600 sm:max-w-xs dark:text-red-400">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={isStreaming || !draft.trim()}
                className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition enabled:hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
              >
                {isStreaming ? "Generating…" : "Send"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
