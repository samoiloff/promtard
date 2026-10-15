"use client";

import type { KeyboardEvent } from "react";

import type { PromptDisplaySegment } from "@/lib/templates/parameters";

const FIELD_CLASS =
  "w-full resize-none bg-transparent px-2 py-2 text-base outline-none whitespace-pre-wrap break-words placeholder:text-zinc-400 disabled:opacity-60";

type HighlightedPromptTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  disabled?: boolean;
  placeholder?: string;
  segments: PromptDisplaySegment[];
  highlightParameters: boolean;
};

export function HighlightedPromptTextarea({
  value,
  onChange,
  onKeyDown,
  rows = 3,
  disabled,
  placeholder,
  segments,
  highlightParameters,
}: HighlightedPromptTextareaProps) {
  if (!highlightParameters) {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={`${FIELD_CLASS} text-zinc-900 dark:text-zinc-100`}
      />
    );
  }

  return (
    <div className="relative">
      <div
        aria-hidden
        className={`${FIELD_CLASS} pointer-events-none absolute inset-0 overflow-hidden text-zinc-900 dark:text-zinc-100`}
      >
        {segments.map((segment, index) =>
          segment.bold ? (
            <span key={index} className="font-semibold">
              {segment.text}
            </span>
          ) : (
            <span key={index}>{segment.text}</span>
          ),
        )}
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={`${FIELD_CLASS} relative text-transparent caret-zinc-900 dark:caret-zinc-100`}
      />
    </div>
  );
}
