"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../lib/utils";

const links = [
  { href: "/ingest", label: "Ingest" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explorer", label: "Explorer" },
  { href: "/correlations", label: "Correlations" },
  { href: "/ai-chat", label: "AI Debug" }
];

export function TopNav() {
  const pathname = usePathname();
  const [theme, toggleTheme] = useTheme();

  return (
    <div className="sticky top-0 z-40 border-b border-white/20 dark:border-slate-800/70 bg-sage-50/80 dark:bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-sage-gradient shadow-md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight">
                LogLens
              </span>
              <span className="text-[10px] uppercase tracking-wide text-sage-700/80 dark:text-sage-200/80 bg-sage-100/80 dark:bg-slate-900/70 rounded-full px-2 py-0.5">
                Intelligent Log Analyzer
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI-assisted observability for microservices.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium rounded-full bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800/80 px-1 py-1">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-1.5 rounded-full transition-colors",
                    active
                      ? "text-sage-900 dark:text-sage-50"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-sage-200/80 dark:bg-sage-600/70 -z-10"
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <span className="hidden sm:inline text-xs mr-1">
              {theme === "light" ? "Dark" : "Light"}
            </span>
            <span className="text-lg">
              {theme === "light" ? "🌙" : "☀️"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
