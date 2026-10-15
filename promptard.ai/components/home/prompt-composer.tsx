"use client";

import { FormEvent, useState } from "react";

import { usePromptComposer } from "@/contexts/prompt-composer-context";
import { usePromptHistoryContext } from "@/contexts/prompt-history-context";

export function PromptComposer() {
  const { draft, setDraft } = usePromptComposer();
  const { addPrompt } = usePromptHistoryContext();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await addPrompt(content);
      setDraft("");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Не удалось сохранить промпт",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Чем могу помочь?
        </h1>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          Промпты сохраняются в истории. Ответ модели подключим на следующем
          шаге.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
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
          rows={4}
          placeholder="Напишите промпт…"
          className="w-full resize-none bg-transparent px-2 py-2 text-base text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        />
        <div className="mt-2 flex items-center justify-between gap-3 px-2 pb-1">
          {submitError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
          ) : (
            <span className="text-xs text-zinc-400">Enter — отправить</span>
          )}
          <button
            type="submit"
            disabled={submitting || !draft.trim()}
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition enabled:hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
          >
            {submitting ? "Сохранение…" : "Отправить"}
          </button>
        </div>
      </form>
    </div>
  );
}
