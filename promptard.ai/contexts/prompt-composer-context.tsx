"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type PromptComposerContextValue = {
  draft: string;
  setDraft: (value: string) => void;
  applyFromHistory: (content: string) => void;
};

const PromptComposerContext = createContext<PromptComposerContextValue | null>(
  null,
);

export function PromptComposerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState("");

  const applyFromHistory = useCallback((content: string) => {
    setDraft(content);
  }, []);

  const value = useMemo(
    () => ({ draft, setDraft, applyFromHistory }),
    [draft, applyFromHistory],
  );

  return (
    <PromptComposerContext.Provider value={value}>
      {children}
    </PromptComposerContext.Provider>
  );
}

export function usePromptComposer() {
  const ctx = useContext(PromptComposerContext);
  if (!ctx) {
    throw new Error("usePromptComposer must be used within PromptComposerProvider");
  }
  return ctx;
}
