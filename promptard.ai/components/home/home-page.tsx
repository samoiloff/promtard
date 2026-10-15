"use client";

import { Suspense } from "react";

import { ChatPanel } from "@/components/home/chat-panel";
import { HomeTemplateLoader } from "@/components/home/home-template-loader";

export function HomePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={null}>
        <HomeTemplateLoader />
      </Suspense>
      <ChatPanel />
    </div>
  );
}
