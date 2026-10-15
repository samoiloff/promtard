"use client";

import { useEffect, useRef, useState } from "react";

import { GROQ_MODELS } from "@/lib/groq/models";

type ModelSelectProps = {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
};

export function ModelSelect({ value, onChange, disabled }: ModelSelectProps) {
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = GROQ_MODELS.find((m) => m.id === value) ?? GROQ_MODELS[0];
  const hovered =
    GROQ_MODELS.find((m) => m.id === hoveredId) ?? selected;

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex max-w-[11rem] items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-left text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50 sm:max-w-[14rem] sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selected.label}</span>
        <svg
          className="ml-auto h-3.5 w-3.5 shrink-0 opacity-60"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div
          className="absolute bottom-full left-0 z-50 mb-2 flex w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
          role="listbox"
        >
          <ul className="max-h-56 min-w-0 flex-1 overflow-y-auto py-1">
            {GROQ_MODELS.map((model) => (
              <li key={model.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={model.id === value}
                  className={`w-full px-3 py-2 text-left text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                    model.id === value
                      ? "bg-zinc-100 font-medium dark:bg-zinc-800"
                      : ""
                  }`}
                  onMouseEnter={() => setHoveredId(model.id)}
                  onClick={() => {
                    onChange(model.id);
                    setOpen(false);
                  }}
                >
                  {model.label}
                </button>
              </li>
            ))}
          </ul>
          <div
            className="hidden w-48 shrink-0 border-l border-zinc-200 bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-600 sm:block dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
          >
            {hovered.description}
          </div>
        </div>
      ) : null}
    </div>
  );
}
