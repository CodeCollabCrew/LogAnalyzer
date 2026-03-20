import { Request, Response } from "express";
import { parseLogLine, ParsedLog } from "../utils/logParser";
import {
  ingestLogs,
  getLogs,
  getLogStats,
  getServiceHealth,
  clearAllLogs
} from "../services/logService";

export async function uploadLogs(req: Request, res: Response) {
  try {
    const { text, url } = req.body as { text?: string; url?: string };
    const files = (req as any).files as Express.Multer.File[] | undefined;

    let rawContent = "";

    if (files && files.length > 0) {
      rawContent = files
        .map((f) => f.buffer.toString("utf8"))
        .join("\n");
    } else if (text) {
      rawContent = text;
    } else if (url) {
      return res
        .status(400)
        .json({ error: "URL ingestion should be handled client-side." });
    } else {
      return res
        .status(400)
        .json({ error: "No log content provided." });
    }

    const lines = rawContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const parsed: ParsedLog[] = [];
    for (const line of lines) {
      const p = parseLogLine(line);
      if (p) parsed.push(p);
    }

    const created = await ingestLogs(parsed);
    return res.json({
      ingested: created.length,
      totalLines: lines.length,
      parsedLines: parsed.length
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Failed to upload logs." });
  }
}

export async function listLogs(req: Request, res: Response) {
  try {
    const { level, service, page = "1", pageSize = "50", search } =
      req.query as Record<string, string | undefined>;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 50;

    const result = await getLogs(
      level as any,
      service,
      pageNum,
      sizeNum,
      search
    );

    return res.json(result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch logs." });
  }
}

export async function analyzeLogsSummary(req: Request, res: Response) {
  try {
    const stats = await getLogStats();
    const health = await getServiceHealth();
    return res.json({ stats, health });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Failed to analyze logs." });
  }
}

export async function clearLogs(req: Request, res: Response) {
  try {
    await clearAllLogs();
    return res.json({ success: true, message: "All logs cleared." });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Failed to clear logs." });
  }
}

