"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { usePromptHistoryContext } from "@/contexts/prompt-history-context";
import {
  GROQ_MODEL_STORAGE_KEY,
  getGroqModelById,
  readStoredGroqModelId,
} from "@/lib/groq/models";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatContextValue = {
  messages: ChatMessage[];
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { addPrompt } = usePromptHistoryContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedModelId, setSelectedModelIdState] = useState(() =>
    readStoredGroqModelId(),
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSelectedModelId = useCallback((id: string) => {
    if (!getGroqModelById(id)) return;
    setSelectedModelIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(GROQ_MODEL_STORAGE_KEY, id);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };
      const assistantId = crypto.randomUUID();

      const nextMessages = [...messages, userMessage];
      setMessages([
        ...nextMessages,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setIsStreaming(true);
      setError(null);

      try {
        await addPrompt(trimmed);
      } catch {
        // sidebar history is best-effort
      }

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: selectedModelId,
            messages: nextMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error ?? "Chat request failed");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const { delta } = JSON.parse(line) as { delta?: string };
              if (!delta) continue;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + delta }
                    : m,
                ),
              );
            } catch {
              // skip
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsStreaming(false);
      }
    },
    [addPrompt, isStreaming, messages, selectedModelId],
  );

  const value = useMemo(
    () => ({
      messages,
      selectedModelId,
      setSelectedModelId,
      isStreaming,
      error,
      sendMessage,
      clearError,
    }),
    [
      messages,
      selectedModelId,
      setSelectedModelId,
      isStreaming,
      error,
      sendMessage,
      clearError,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return ctx;
}
