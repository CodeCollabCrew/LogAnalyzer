"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { analyzeSummaryApi, fetchPatternsApi } from "../../lib/api";
import { Card, CardSubtitle, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

interface Stats {
  total: number;
  byLevel: Record<string, number>;
  uniquePatterns: number;
}

interface HealthEntry {
  service: string;
  counts: Record<string, number>;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<HealthEntry[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const [summary, p] = await Promise.all([
          analyzeSummaryApi(),
          fetchPatternsApi()
        ]);
        setStats(summary.stats);
        setHealth(summary.health);
        setPatterns(p.patterns || []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const skeleton =
    "animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800/70";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          LogLens overview
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          High-level log volume, error mix, service health, and detected
          patterns.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 md:gap-5">
        <Card>
          <CardTitle>Total log lines</CardTitle>
          <CardSubtitle>Indexed in MongoDB</CardSubtitle>
          <div className="mt-4 text-2xl font-semibold">
            {loading ? (
              <div className={`${skeleton} h-7 w-16`} />
            ) : (
              stats?.total ?? 0
            )}
          </div>
        </Card>
        {["CRITICAL", "ERROR", "WARN", "INFO"].map((lvl) => (
          <Card key={lvl}>
            <CardTitle>{lvl}</CardTitle>
            <CardSubtitle>Log lines</CardSubtitle>
            <div className="mt-4 text-2xl font-semibold">
              {loading ? (
                <div className={`${skeleton} h-7 w-12`} />
              ) : (
                stats?.byLevel?.[lvl] ?? 0
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-5">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card>
            <CardTitle>Error distribution</CardTitle>
            <CardSubtitle>
              Relative share of CRITICAL / ERROR / WARN / INFO.
            </CardSubtitle>
            <div className="mt-4 space-y-2">
              {["CRITICAL", "ERROR", "WARN", "INFO"].map((lvl) => {
                const value = stats?.byLevel?.[lvl] ?? 0;
                const total = stats?.total || 1;
                const pct = Math.round((value / total) * 100);
                const color =
                  lvl === "CRITICAL"
                    ? "bg-red-500"
                    : lvl === "ERROR"
                    ? "bg-orange-500"
                    : lvl === "WARN"
                    ? "bg-yellow-400"
                    : "bg-emerald-500";
                return (
                  <div key={lvl}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>{lvl}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {loading ? "…" : `${pct}%`}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200/80 dark:bg-slate-800/80 overflow-hidden">
                      <div
                        className={`${color} h-full transition-all`}
                        style={{ width: loading ? "0%" : `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <Card>
            <CardTitle>Service health</CardTitle>
            <CardSubtitle>Error rate per service.</CardSubtitle>
            <div className="mt-4 space-y-2 max-h-64 overflow-auto pr-1">
              {loading
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`${skeleton} h-10 w-full`}
                    />
                  ))
                : health.map((h) => {
                    const totalErrors =
                      (h.counts.CRITICAL || 0) +
                      (h.counts.ERROR || 0) +
                      (h.counts.WARN || 0);
                    const levelColor =
                      totalErrors === 0
                        ? "bg-emerald-500"
                        : h.counts.CRITICAL > 0
                        ? "bg-red-500"
                        : h.counts.ERROR > 0
                        ? "bg-orange-500"
                        : "bg-yellow-400";
                    return (
                      <div
                        key={h.service}
                        className="flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="font-medium">{h.service}</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200/80 dark:bg-slate-800/80 overflow-hidden">
                          <div
                            className={`${levelColor} h-full`}
                            style={{
                              width:
                                totalErrors === 0
                                  ? "10%"
                                  : "100%"
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 w-20 text-right">
                          {h.counts.CRITICAL} C · {h.counts.ERROR} E ·{" "}
                          {h.counts.WARN} W
                        </span>
                      </div>
                    );
                  })}
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          <Card>
            <CardTitle>Repeating error patterns</CardTitle>
            <CardSubtitle>
              Normalized messages grouped by similarity.
            </CardSubtitle>
            <div className="mt-4 space-y-2 max-h-64 overflow-auto pr-1">
              {loading
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`${skeleton} h-9 w-full`}
                    />
                  ))
                : patterns.slice(0, 8).map((p: any) => (
                    <div
                      key={p._id}
                      className="flex items-start justify-between gap-2 text-xs"
                    >
                      <div className="flex-1">
                        <p className="line-clamp-2 text-[11px] text-slate-800 dark:text-slate-100">
                          {p.pattern}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                          e.g. {p.example}
                        </p>
                      </div>
                      <Badge>×{p.frequency}</Badge>
                    </div>
                  ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

