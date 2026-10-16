"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { ChatGptIcon } from "@/components/icons/chatgpt-icon";
import { CopyIcon } from "@/components/icons/copy-icon";
import { GeminiIcon } from "@/components/icons/gemini-icon";
import { SaveIcon } from "@/components/icons/save-icon";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { copyTextToClipboard } from "@/lib/clipboard";
import { resolvedComposerPrompt } from "@/lib/templates/composer-prompt";

const GEMINI_URL = "https://gemini.google.com/";
const COPIED_LABEL_MS = 2000;

function chatGptLaunchUrl(prompt: string): string {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}

const actionButtonClass =
  "flex min-w-[4.5rem] flex-col items-center gap-1 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900";

const exportActionButtonClass =
  "flex min-w-[4.5rem] flex-col items-center gap-1 rounded-2xl border border-zinc-200 bg-white p-0 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900";

type ComposerPromptRailProps = {
  variant: "home" | "template";
  draft: string;
  templateBody: string | null;
  parameterValues: Record<string, string>;
  onEdit?: () => void;
  onNewTemplate?: () => void;
};

function RailActionButton({
  label,
  icon,
  onClick,
  disabled,
  className = exportActionButtonClass,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function ComposerPromptRail({
  variant,
  draft,
  templateBody,
  parameterValues,
  onEdit,
  onNewTemplate,
}: ComposerPromptRailProps) {
  const [copyLabel, setCopyLabel] = useState<"Copy" | "Copied">("Copy");
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolvedPrompt = useMemo(
    () => resolvedComposerPrompt(draft, templateBody, parameterValues),
    [draft, templateBody, parameterValues],
  );
  const canExport = resolvedPrompt.length > 0;

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  async function copyPrompt(): Promise<boolean> {
    if (!canExport) return false;
    try {
      await copyTextToClipboard(resolvedPrompt);
      return true;
    } catch {
      return false;
    }
  }

  async function handleCopy() {
    const ok = await copyPrompt();
    if (!ok) return;
    setCopyLabel("Copied");
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => {
      setCopyLabel("Copy");
      copyTimeoutRef.current = null;
    }, COPIED_LABEL_MS);
  }

  function handleOpenGemini() {
    void copyPrompt();
    window.open(GEMINI_URL, "_blank", "noopener,noreferrer");
  }

  function handleOpenChatGpt() {
    if (!canExport) return;
    void copyPrompt();
    window.open(
      chatGptLaunchUrl(resolvedPrompt),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="flex shrink-0 flex-col justify-between self-stretch">
      {variant === "template" ? (
        <button
          type="button"
          onClick={onEdit}
          className={actionButtonClass}
        >
          <PencilIcon />
          <span>edit</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onNewTemplate}
          disabled={!canExport}
          className={exportActionButtonClass}
        >
          <SaveIcon />
          <span>Save</span>
        </button>
      )}

      <div className="flex flex-col gap-2">
        <RailActionButton
          label="Gemini"
          icon={<GeminiIcon />}
          onClick={handleOpenGemini}
          disabled={!canExport}
        />
        <RailActionButton
          label="Chatgpt"
          icon={<ChatGptIcon />}
          onClick={handleOpenChatGpt}
          disabled={!canExport}
        />
        <button
          type="button"
          onClick={() => void handleCopy()}
          disabled={!canExport}
          className={exportActionButtonClass}
        >
          <CopyIcon />
          <span>{copyLabel}</span>
        </button>
      </div>
    </div>
  );
}
