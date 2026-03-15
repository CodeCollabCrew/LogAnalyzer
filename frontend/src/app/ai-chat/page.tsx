"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardSubtitle, CardTitle } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { runAIDebugApi } from "../../lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AIChatPage() {
  const [question, setQuestion] = useState(
    "What are the main errors and likely root causes in the current system?"
  );
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const send = async () => {
    if (!question.trim()) return;
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      content: question.trim()
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await runAIDebugApi({ question: question.trim() });
      const formatted =
        `Root Cause:\n${res.rootCause}\n\n` +
        (res.affectedServices?.length
          ? `Affected Services:\n- ${res.affectedServices.join("\n- ")}\n\n`
          : "") +
        (res.possibleFixes?.length
          ? `Possible Fixes:\n- ${res.possibleFixes.join("\n- ")}\n\n`
          : "") +
        (res.preventionTips?.length
          ? `Prevention Tips:\n- ${res.preventionTips.join("\n- ")}`
          : "");

      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: formatted
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 2),
        role: "assistant",
        content: `Failed to run AI analysis: ${e.message || e.toString()}`
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          AI debugging assistant
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ask LogLens about failures, root causes, and fixes across your
          ingested logs.
        </p>
      </div>

      <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 md:gap-5">
        <Card>
          <CardTitle>Ask a question</CardTitle>
          <CardSubtitle>
            We forward a summary of recent logs and your question to Grok.
          </CardSubtitle>
          <div className="mt-3 space-y-3">
            <Textarea
              rows={6}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Button onClick={send} disabled={loading}>
              {loading ? "Asking Grok…" : "Ask Grok"}
            </Button>
          </div>
        </Card>

        <motion.div
          className="glass-card flex flex-col max-h-[440px]"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-4 pt-4 pb-2 border-b border-sage-100/80 dark:border-slate-800/80">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-200">
              Conversation
            </p>
          </div>
          <div className="flex-1 overflow-auto px-4 py-3 space-y-3 text-xs">
            {messages.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Ask a question such as{" "}
                <span className="italic">
                  “Why is db-service failing?” or “What caused the API
                  failures?”
                </span>
                . LogLens will summarize the most recent logs and highlight
                likely root causes, fixes, and prevention tips.
              </p>
            ) : (
              messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl px-3 py-2 max-w-full whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-sage-500/90 text-white ml-auto"
                      : "bg-slate-900/70 text-slate-100 border border-slate-700/80"
                  }`}
                >
                  {m.content}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

