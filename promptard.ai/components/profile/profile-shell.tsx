"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/profile/templates", label: "My templates" },
  { href: "/profile/likes", label: "My likes" },
  { href: "/profile/history", label: "History" },
] as const;

export function ProfileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <nav
        className="flex w-56 shrink-0 flex-col gap-1 border-r border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950"
        aria-label="Profile"
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "rounded-lg bg-zinc-200/80 px-3 py-2 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-900"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
