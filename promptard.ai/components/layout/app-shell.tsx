"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthHeader } from "@/components/layout/auth-header";
import { FloppyAiIcon } from "@/components/icons/floppy-ai-icon";
import { PromptHistorySidebar } from "@/components/layout/prompt-history-sidebar";
import { MergeGuestHistory } from "@/components/auth/merge-guest-history";
import { usePromptHistoryContext } from "@/contexts/prompt-history-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHistorySidebar = pathname.startsWith("/profile");
  const { refresh } = usePromptHistoryContext();

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <MergeGuestHistory onMerged={() => void refresh()} />
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight text-zinc-900 transition hover:opacity-80 dark:text-zinc-100"
        >
          <FloppyAiIcon className="h-6 w-6 shrink-0" />
          <span>Promptard.io</span>
        </Link>
        <AuthHeader />
      </header>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {!hideHistorySidebar ? (
          <div className="hidden h-full min-h-0 w-72 shrink-0 flex-col overflow-hidden md:flex lg:w-80">
            <PromptHistorySidebar />
          </div>
        ) : null}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
