"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
} from "react";

import type { PromptDisplaySegment } from "@/lib/templates/parameters";

const FIELD_CLASS =
  "w-full resize-none bg-transparent px-2 py-2 text-base outline-none whitespace-pre-wrap break-words placeholder:text-zinc-400 disabled:opacity-60";

const BACKDROP_SCROLL_CLASS =
  "overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

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
  const backdropRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const syncScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const backdrop = backdropRef.current;
    if (!textarea || !backdrop) return;
    backdrop.scrollTop = textarea.scrollTop;
    backdrop.scrollLeft = textarea.scrollLeft;
  }, []);

  useLayoutEffect(() => {
    if (!highlightParameters) return;
    syncScroll();
  }, [highlightParameters, value, segments, syncScroll]);

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
        ref={backdropRef}
        aria-hidden
        className={`${FIELD_CLASS} ${BACKDROP_SCROLL_CLASS} pointer-events-none absolute inset-0 text-zinc-900 dark:text-zinc-100`}
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
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={syncScroll}
        onKeyDown={onKeyDown}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={`${FIELD_CLASS} relative text-transparent caret-zinc-900 dark:caret-zinc-100`}
      />
    </div>
  );
}
