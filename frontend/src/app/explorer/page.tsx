"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchLogsApi } from "../../lib/api";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardTitle, CardSubtitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

const LEVELS = ["ALL", "CRITICAL", "ERROR", "WARN", "INFO", "DEBUG"] as const;

interface LogRow {
  _id: string;
  timestamp: string;
  service: string;
  level: string;
  message: string;
}

export default function ExplorerPage() {
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(30);
  const [total, setTotal] = useState(0);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchLogsApi({
        level: level === "ALL" ? undefined : level,
        search,
        page,
        pageSize
      });
      setLogs(res.data || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const levelColor = (lvl: string) => {
    switch (lvl) {
      case "CRITICAL":
        return "bg-red-500/90 text-white";
      case "ERROR":
        return "bg-orange-500/90 text-white";
      case "WARN":
        return "bg-yellow-400 text-slate-900";
      case "INFO":
        return "bg-emerald-500/90 text-white";
      default:
        return "bg-slate-500/90 text-white";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Log explorer
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search and filter raw log lines across services and severities.
          </p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex flex-wrap gap-1 text-[11px]">
            {LEVELS.map((lvl) => {
              const active = level === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setLevel(lvl);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full border text-xs transition-colors ${
                    active
                      ? "bg-sage-500 text-white border-sage-500"
                      : "border-sage-200/80 dark:border-slate-700/80 bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 hover:bg-sage-100/60 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="Search message or raw line…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => {
                setPage(1);
                load();
              }}
            >
              Search
            </Button>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages} · {total} logs
          </div>
        </div>
      </Card>

      <motion.div
        className="glass-card overflow-hidden"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-h-[480px] overflow-auto text-xs">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 bg-sage-50/80 dark:bg-slate-900/90 backdrop-blur border-b border-sage-100/70 dark:border-slate-800/80">
              <tr className="text-[11px] text-slate-500 dark:text-slate-400">
                <th className="px-3 py-2 text-left font-medium w-40">
                  Timestamp
                </th>
                <th className="px-3 py-2 text-left font-medium w-36">
                  Service
                </th>
                <th className="px-3 py-2 text-left font-medium w-24">
                  Level
                </th>
                <th className="px-3 py-2 text-left font-medium">
                  Message
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                  >
                    Loading logs…
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                  >
                    No logs matched your filters. Try ingesting logs from the
                    Ingest page.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr
                    key={l._id}
                    className="border-b border-sage-50/50 dark:border-slate-800/70 hover:bg-sage-50/80 dark:hover:bg-slate-900/70 transition-colors"
                  >
                    <td className="px-3 py-1.5 align-top whitespace-nowrap text-[11px] text-slate-600 dark:text-slate-300">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="px-3 py-1.5 align-top text-[11px]">
                      <Badge>{l.service}</Badge>
                    </td>
                    <td className="px-3 py-1.5 align-top">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${levelColor(
                          l.level
                        )}`}
                      >
                        {l.level}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 align-top text-[11px] text-slate-800 dark:text-slate-100">
                      {l.message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-3 py-2 border-t border-sage-100/70 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            Showing {logs.length} of {total} logs
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <span>
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="ghost"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

