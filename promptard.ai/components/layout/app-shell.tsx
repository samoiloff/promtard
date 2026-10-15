"use client";

import { AuthHeader } from "@/components/layout/auth-header";
import { PromptHistorySidebar } from "@/components/layout/prompt-history-sidebar";
import { MergeGuestHistory } from "@/components/auth/merge-guest-history";
import { usePromptHistoryContext } from "@/contexts/prompt-history-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { refresh } = usePromptHistoryContext();

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <MergeGuestHistory onMerged={() => void refresh()} />
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-6">
        <span className="text-lg font-semibold tracking-tight">Promptard</span>
        <AuthHeader />
      </header>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="hidden h-full min-h-0 w-72 shrink-0 flex-col overflow-hidden md:flex lg:w-80">
          <PromptHistorySidebar />
        </div>
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
