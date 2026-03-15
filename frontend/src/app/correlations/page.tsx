"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchCorrelationsApi } from "../../lib/api";
import { Card, CardSubtitle, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

interface Correlation {
  _id: string;
  serviceA: string;
  serviceB: string;
  count: number;
}

export default function CorrelationsPage() {
  const [data, setData] = useState<Correlation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetchCorrelationsApi();
        setData(res.correlations || []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          Error correlation engine
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Discover microservices that tend to fail together across time
          windows.
        </p>
      </div>

      <motion.div
        className="grid md:grid-cols-3 gap-4 md:gap-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="glass-card h-24 animate-pulse bg-slate-200/70 dark:bg-slate-800/70"
            />
          ))
        ) : data.length === 0 ? (
          <Card className="md:col-span-3">
            <CardTitle>No correlations yet</CardTitle>
            <CardSubtitle>
              Ingest logs with errors and warnings to compute co-occurrence
              scores.
            </CardSubtitle>
          </Card>
        ) : (
          data.map((c) => (
            <Card key={c._id}>
              <CardTitle>Service pair</CardTitle>
              <CardSubtitle>
                Services that frequently co-fail within 60s windows.
              </CardSubtitle>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <Badge>{c.serviceA}</Badge>
                    <span className="text-[10px] text-slate-400">
                      ↔
                    </span>
                    <Badge>{c.serviceB}</Badge>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Co-occurrences in windowed error logs.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold">
                    ×{c.count}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    co-failure events
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </motion.div>
    </div>
  );
}

