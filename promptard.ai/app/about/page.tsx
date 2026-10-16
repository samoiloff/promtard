import type { Metadata } from "next";

import { AboutPage } from "@/components/about/about-page";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutRoute() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <AboutPage />
    </div>
  );
}
