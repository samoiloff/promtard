"use client";

import { ToastHost } from "@/components/chat/toast";
import { AppShell } from "@/components/layout/app-shell";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ChatProvider } from "@/contexts/chat-context";
import { PromptComposerProvider } from "@/contexts/prompt-composer-context";
import { PromptHistoryProvider } from "@/contexts/prompt-history-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <PromptComposerProvider>
        <PromptHistoryProvider>
          <ChatProvider>
            <AppShell>{children}</AppShell>
            <ToastHost />
          </ChatProvider>
        </PromptHistoryProvider>
      </PromptComposerProvider>
    </AuthSessionProvider>
  );
}
