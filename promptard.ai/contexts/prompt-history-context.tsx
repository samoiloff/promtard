"use client";

import { createContext, useContext } from "react";

import { usePromptHistory } from "@/hooks/use-prompt-history";

type PromptHistoryContextValue = ReturnType<typeof usePromptHistory>;

const PromptHistoryContext = createContext<PromptHistoryContextValue | null>(
  null,
);

export function PromptHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = usePromptHistory();
  return (
    <PromptHistoryContext.Provider value={value}>
      {children}
    </PromptHistoryContext.Provider>
  );
}

export function usePromptHistoryContext() {
  const ctx = useContext(PromptHistoryContext);
  if (!ctx) {
    throw new Error(
      "usePromptHistoryContext must be used within PromptHistoryProvider",
    );
  }
  return ctx;
}
