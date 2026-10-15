"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

import { PROMPT_HISTORY_MERGE_FLAG_KEY } from "@/lib/history/constants";
import {
  clearLocalPromptHistory,
  readLocalPromptHistory,
} from "@/lib/history/local";

export function MergeGuestHistory({ onMerged }: { onMerged?: () => void }) {
  const { data: session, status } = useSession();
  const merging = useRef(false);

  useEffect(() => {
    const userId = session?.user?.id;
    if (status !== "authenticated" || !userId || merging.current) return;

    const localItems = readLocalPromptHistory();
    if (localItems.length === 0) return;

    const flagKey = `${PROMPT_HISTORY_MERGE_FLAG_KEY}:${userId}`;
    if (sessionStorage.getItem(flagKey) === "done") return;

    merging.current = true;

    void (async () => {
      try {
        const response = await fetch("/api/prompt-history/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: localItems }),
        });

        if (response.ok) {
          clearLocalPromptHistory();
          sessionStorage.setItem(flagKey, "done");
          onMerged?.();
        }
      } finally {
        merging.current = false;
      }
    })();
  }, [status, session?.user?.id, onMerged]);

  return null;
}
