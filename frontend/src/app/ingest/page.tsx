"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Card, CardTitle, CardSubtitle } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { uploadLogsApi, uploadLogFilesApi } from "../../lib/api";

export default function IngestPage() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      let payloadText = text;
      if (!payloadText && url) {
        const res = await fetch(url);
        payloadText = await res.text();
      }

      const res = await uploadLogsApi({ text: payloadText });
      setResult(
        `Ingested ${res.ingested} parsed lines out of ${res.totalLines} total.`
      );
    } catch (e: any) {
      setError(e.message || "Failed to analyze logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const res = await uploadLogFilesApi(files);
      setResult(
        `Uploaded ${files.length} file(s). Ingested ${res.ingested} parsed lines out of ${res.totalLines} total.`
      );
    } catch (e: any) {
      setError(e.message || "Failed to upload log files.");
    } finally {
      setLoading(false);
      // Allow selecting the same file again later
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Ingest logs into LogLens
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload log files, paste snippets, or pull logs from a URL to begin
            AI-assisted analysis.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          className="md:col-span-2 space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card>
            <CardTitle>Paste logs</CardTitle>
            <CardSubtitle>
              Ideal for copying segments from terminals or log aggregation tools.
            </CardSubtitle>
            <div className="mt-3">
              <Textarea
                rows={14}
                placeholder="2024-01-15 08:00:02 [db-service] ERROR Connection timeout after 5000ms..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </Card>
          <Card>
            <CardTitle>Fetch from URL</CardTitle>
            <CardSubtitle>
              Provide a URL that returns plain-text logs (S3, Git raw, etc).
            </CardSubtitle>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="https://example.com/logs/app.log"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button
                variant="outline"
                size="md"
                type="button"
                onClick={() =>
                  setText(
                    "2024-01-15 08:00:02 [db-service] ERROR Connection timeout after 5000ms"
                  )
                }
              >
                Sample
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card>
            <CardTitle>Upload files</CardTitle>
            <CardSubtitle>.log · .txt · .json · .csv</CardSubtitle>
            <div className="mt-4 border-2 border-dashed border-sage-200/80 dark:border-slate-700/80 rounded-2xl px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40 flex flex-col items-center gap-3">
              <p>Drag & drop or choose log files from your machine.</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleFilePick}
                disabled={loading}
              >
                Select files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".log,.txt,.json,.csv"
                multiple
                className="hidden"
                onChange={handleFilesSelected}
              />
            </div>
          </Card>
          <Card>
            <CardTitle>Analyze</CardTitle>
            <CardSubtitle>
              Parsed logs are stored in MongoDB and used by all dashboards.
            </CardSubtitle>
            <div className="mt-4 flex flex-col gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={loading || (!text && !url)}
              >
                {loading ? "Analyzing..." : "Analyze & Ingest"}
              </Button>
              {result && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {result}
                </p>
              )}
              {error && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

