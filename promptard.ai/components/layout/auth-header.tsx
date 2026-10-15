"use client";

import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthHeader() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
    );
  }

  if (!session?.user) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => signIn("google")}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Google
        </button>
        <button
          type="button"
          onClick={() => signIn("facebook")}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Facebook
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session.user.image ? (
        <Image
          src={session.user.image}
          alt=""
          width={32}
          height={32}
          className="rounded-full"
        />
      ) : null}
      <span className="hidden max-w-[140px] truncate text-sm text-zinc-600 dark:text-zinc-400 sm:inline">
        {session.user.name ?? session.user.email}
      </span>
      <button
        type="button"
        onClick={() => signOut()}
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        Выйти
      </button>
    </div>
  );
}
