"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthHeader } from "@/components/layout/auth-header";
import { MainNav } from "@/components/layout/main-nav";
import { PromptHistorySidebar } from "@/components/layout/prompt-history-sidebar";
import { MergeGuestHistory } from "@/components/auth/merge-guest-history";
import { usePromptComposer } from "@/contexts/prompt-composer-context";
import { usePromptHistoryContext } from "@/contexts/prompt-history-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden">
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    );
  }

  const hideHistorySidebar =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/browse") ||
    pathname.startsWith("/about");
  const { refresh } = usePromptHistoryContext();
  const { resetHomeComposer } = usePromptComposer();

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <MergeGuestHistory onMerged={() => void refresh()} />
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-6">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:gap-6">
          <Link
            href="/"
            onClick={() => resetHomeComposer()}
            className="flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight text-zinc-900 transition hover:opacity-80 dark:text-zinc-100"
          >
            <Image
              src="/logo.png"
              alt=""
              width={81}
              height={50}
              className="h-7 w-auto shrink-0 dark:invert"
              priority
            />
            <span>promtard.com</span>
          </Link>
          <MainNav />
        </div>
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
