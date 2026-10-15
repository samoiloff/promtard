import {
  PROMPT_HISTORY_MAX_ITEMS,
  PROMPT_HISTORY_STORAGE_KEY,
} from "@/lib/history/constants";
import type { LocalPromptHistoryItem } from "@/lib/history/types";

function parseStored(raw: string | null): LocalPromptHistoryItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as LocalPromptHistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.content === "string" &&
        typeof item.createdAt === "string",
    );
  } catch {
    return [];
  }
}

export function readLocalPromptHistory(): LocalPromptHistoryItem[] {
  if (typeof window === "undefined") return [];
  return parseStored(localStorage.getItem(PROMPT_HISTORY_STORAGE_KEY));
}

export function writeLocalPromptHistory(items: LocalPromptHistoryItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    PROMPT_HISTORY_STORAGE_KEY,
    JSON.stringify(items.slice(0, PROMPT_HISTORY_MAX_ITEMS)),
  );
}

export function appendLocalPromptHistory(content: string): LocalPromptHistoryItem {
  const item: LocalPromptHistoryItem = {
    id: crypto.randomUUID(),
    content,
    createdAt: new Date().toISOString(),
  };
  const next = [item, ...readLocalPromptHistory()].slice(
    0,
    PROMPT_HISTORY_MAX_ITEMS,
  );
  writeLocalPromptHistory(next);
  return item;
}

export function clearLocalPromptHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROMPT_HISTORY_STORAGE_KEY);
}
