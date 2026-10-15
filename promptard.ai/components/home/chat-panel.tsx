"use client";

import { FormEvent, useEffect, useMemo, useRef } from "react";

import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ModelSelect } from "@/components/chat/model-select";
import { HighlightedPromptTextarea } from "@/components/home/highlighted-prompt-textarea";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { useChat } from "@/contexts/chat-context";
import { usePromptComposer } from "@/contexts/prompt-composer-context";
import { useTemplateActions } from "@/hooks/use-template-actions";
import {
  parameterNamesFromBody,
  promptDisplaySegments,
  substituteParameters,
} from "@/lib/templates/parameters";

export function ChatPanel() {
  const {
    draft,
    setDraft,
    activeTemplateId,
    canEditActiveTemplate,
    templateBody,
    parameterValues,
    setParameterValue,
    clearActiveTemplate,
  } = usePromptComposer();
  const { openEditor } = useTemplateActions();
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
  const parameterNames = useMemo(
    () => parameterNamesFromBody(templateBody ?? draft),
    [templateBody, draft],
  );
  const promptSegments = useMemo(
    () => promptDisplaySegments(draft, templateBody, parameterValues),
    [draft, templateBody, parameterValues],
  );
  const highlightParameters = parameterNames.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isStreaming) return;
    const content =
      templateBody !== null
        ? trimmed
        : substituteParameters(trimmed, parameterValues);
    setDraft("");
    clearActiveTemplate();
    clearError();
    await sendMessage(content);
  }

  function handleEditTemplate() {
    if (!activeTemplateId) return;
    void openEditor(activeTemplateId, canEditActiveTemplate, draft);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
      >
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
        <div className="mx-auto flex w-full max-w-3xl items-stretch gap-3">
          <form
            onSubmit={handleSubmit}
            className="min-w-0 flex-1 rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <HighlightedPromptTextarea
              value={draft}
              onChange={setDraft}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              rows={3}
              disabled={isStreaming}
              placeholder="Напишите промпт…"
              segments={promptSegments}
              highlightParameters={highlightParameters}
            />

            {parameterNames.length > 0 ? (
              <div className="mt-2 space-y-2 border-t border-zinc-100 px-1 pt-3 dark:border-zinc-800">
                <p className="text-xs font-medium text-zinc-500">Параметры</p>
                {parameterNames.map((name) => (
                  <label key={name} className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      {name}
                    </span>
                    <input
                      type="text"
                      value={parameterValues[name] ?? ""}
                      onChange={(event) =>
                        setParameterValue(name, event.target.value)
                      }
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                      placeholder={`Значение для ${name}`}
                    />
                  </label>
                ))}
              </div>
            ) : null}

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

          {activeTemplateId ? (
            <button
              type="button"
              onClick={handleEditTemplate}
              className="flex shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              <PencilIcon />
              <span>редактировать</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
