"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/browse/recent", label: "Recent" },
  { href: "/browse/popular", label: "Popular" },
  { href: "/browse/search", label: "Search" },
  { href: "/about", label: "About" },
] as const;

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap items-center gap-1 sm:gap-2"
      aria-label="Main menu"
    >
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "rounded-full px-3 py-1.5 text-sm font-bold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
