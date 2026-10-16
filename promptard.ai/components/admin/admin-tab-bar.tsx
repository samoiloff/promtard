"use client";

import Link from "next/link";

import {
  ADMIN_TABLE_ORDER,
  ADMIN_TABLES,
  IMPORT_TAB_KEY,
} from "@/lib/admin/table-registry";

type AdminTabBarProps = {
  activeTab: string;
};

export function AdminTabBar({ activeTab }: AdminTabBarProps) {
  return (
    <nav
      className="flex flex-wrap gap-1 border-b border-zinc-200 pb-2 dark:border-zinc-800"
      aria-label="Admin tables"
    >
      {ADMIN_TABLE_ORDER.map((key) => (
        <Link
          key={key}
          href={`/admin?tab=${key}`}
          className={
            activeTab === key
              ? "rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          }
        >
          {ADMIN_TABLES[key].label}
        </Link>
      ))}
      <Link
        href={`/admin?tab=${IMPORT_TAB_KEY}`}
        className={
          activeTab === IMPORT_TAB_KEY
            ? "rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        }
      >
        Import
      </Link>
    </nav>
  );
}
