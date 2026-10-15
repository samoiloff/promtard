"use client";

import { Suspense, useState } from "react";
import { useSession } from "next-auth/react";

import { LoginModal } from "@/components/auth/login-modal";
import { UserMenu } from "@/components/layout/user-menu";

export function AuthHeader() {
  const { data: session, status } = useSession();
  const [loginOpen, setLoginOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
    );
  }

  if (!session?.user) {
    return (
      <>
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Log In
        </button>
        <Suspense fallback={null}>
          <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
        </Suspense>
      </>
    );
  }

  return <UserMenu user={session.user} />;
}
