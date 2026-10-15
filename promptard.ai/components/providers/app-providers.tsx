"use client";

import { AuthSessionProvider } from "@/components/providers/session-provider";
import { PromptComposerProvider } from "@/contexts/prompt-composer-context";
import { PromptHistoryProvider } from "@/contexts/prompt-history-context";
import { AppShell } from "@/components/layout/app-shell";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <PromptComposerProvider>
        <PromptHistoryProvider>
          <AppShell>{children}</AppShell>
        </PromptHistoryProvider>
      </PromptComposerProvider>
    </AuthSessionProvider>
  );
}
