"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminDataTab } from "@/components/admin/admin-data-tab";
import { AdminImportTab } from "@/components/admin/admin-import-tab";
import { AdminTabBar } from "@/components/admin/admin-tab-bar";
import {
  IMPORT_TAB_KEY,
  parseAdminTabParam,
  type AdminTableKey,
} from "@/lib/admin/table-registry";

export function AdminPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseAdminTabParam(searchParams.get("tab"));

  const [authed, setAuthed] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadSession() {
      try {
        const response = await fetch("/api/admin/session");
        const data = (await response.json()) as { authed?: boolean };
        if (!cancelled) setAuthed(Boolean(data.authed));
      } catch {
        if (!cancelled) setAuthed(false);
      } finally {
        if (!cancelled) setSessionChecked(true);
      }
    }
    void loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Login failed");
      }
      setAuthed(true);
      setPassword("");
      router.refresh();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold tracking-tight">Admin</h1>
        {authed ? (
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Log out
          </button>
        ) : null}
      </div>

      {!sessionChecked ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : !authed ? (
        <form onSubmit={handleLogin} className="flex max-w-sm flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          {loginError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{loginError}</p>
          ) : null}
          <button
            type="submit"
            disabled={loginLoading || !password}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {loginLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <>
          <AdminTabBar activeTab={activeTab} />
          {activeTab === IMPORT_TAB_KEY ? (
            <AdminImportTab />
          ) : (
            <AdminDataTab tableKey={activeTab as AdminTableKey} />
          )}
        </>
      )}
    </div>
  );
}
