import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";

import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

const cascadiaMono = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/cascadia-mono/files/cascadia-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/cascadia-mono/files/cascadia-mono-cyrillic-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/cascadia-mono/files/cascadia-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/cascadia-mono/files/cascadia-mono-cyrillic-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-cascadia-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Promptard",
  description: "Personal prompt board",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${cascadiaMono.variable} h-full font-mono antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden">
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
