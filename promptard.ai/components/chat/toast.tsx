"use client";

import { useEffect, useState } from "react";

type ToastState = { message: string } | null;

let showToastImpl: ((message: string) => void) | null = null;

export function showToast(message: string) {
  showToastImpl?.(message);
}

export function ToastHost() {
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    showToastImpl = (message: string) => {
      setToast({ message });
      window.setTimeout(() => setToast(null), 3000);
    };
    return () => {
      showToastImpl = null;
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
    >
      {toast.message}
    </div>
  );
}
