import "../app/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { TopNav } from "../components/layout/TopNav";

export const metadata: Metadata = {
  title: "LogLens – Intelligent Log Analyzer",
  description:
    "AI-powered log analysis, error pattern detection, and debugging insights for microservices."
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-sage-gradient/40 dark:bg-slate-950">
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-sage-300/60 blur-3xl" />
            <div className="absolute top-40 -right-24 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col min-h-screen">
            <TopNav />
            <main className="flex-1">
              <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
                {children}
              </div>
            </main>
            <footer className="border-t border-white/10 dark:border-slate-800/80 text-[10px] text-center text-slate-500 dark:text-slate-500 py-3">
              LogLens · Intelligent Log Analyzer · {new Date().getFullYear()}
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}

