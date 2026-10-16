import { Suspense } from "react";

import { AdminPanel } from "@/components/admin/admin-panel";

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-zinc-500">Loading admin…</div>
      }
    >
      <AdminPanel />
    </Suspense>
  );
}
