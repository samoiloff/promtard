"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import {
  appendLocalPromptHistory,
  readLocalPromptHistory,
} from "@/lib/history/local";
import { fetchJson } from "@/lib/api/read-json-response";
import type { PromptHistoryItem } from "@/lib/history/types";

async function fetchRemoteHistory(): Promise<PromptHistoryItem[]> {
  const { response, data } = await fetchJson<{ items: PromptHistoryItem[] }>(
    "/api/prompt-history",
  );
  if (!response.ok) {
    throw new Error("Failed to load history");
  }
  return data.items;
}

export function usePromptHistory() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [items, setItems] = useState<PromptHistoryItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!isAuthenticated) {
      const frame = requestAnimationFrame(() => {
        setItems(readLocalPromptHistory());
        setError(null);
      });
      return () => cancelAnimationFrame(frame);
    }

    let active = true;

    void Promise.resolve()
      .then(() => {
        if (!active) return;
        setIsFetching(true);
        return fetchRemoteHistory();
      })
      .then((remoteItems) => {
        if (!active || !remoteItems) return;
        setItems(remoteItems);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load history");
      })
      .finally(() => {
        if (active) setIsFetching(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, status]);

  const loading = status === "loading" || isFetching;

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems(readLocalPromptHistory());
      setError(null);
      return;
    }

    setIsFetching(true);
    try {
      setItems(await fetchRemoteHistory());
      setError(null);
    } catch {
      setError("Failed to load history");
    } finally {
      setIsFetching(false);
    }
  }, [isAuthenticated]);

  const addPrompt = useCallback(
    async (content: string) => {
      if (!isAuthenticated) {
        const item = appendLocalPromptHistory(content);
        setItems((prev) => [item, ...prev]);
        return item;
      }

      const { response, data } = await fetchJson<{
        item: PromptHistoryItem;
        error?: string;
      }>("/api/prompt-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save prompt");
      }
      setItems((prev) => [data.item, ...prev]);
      return data.item;
    },
    [isAuthenticated],
  );

  return {
    items,
    loading,
    error,
    refresh,
    addPrompt,
    isAuthenticated,
  };
}
