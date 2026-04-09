import { LogLevel } from "../models/Log";

export interface ParsedLog {
  timestamp: Date;
  service: string;
  level: LogLevel;
  message: string;
  rawLine: string;
}

const LOG_REGEX =
  /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[([^\]]+)] (\w+)\s+(.*)$/;

// support standard quotes and smart quotes that get added from Rich Text editors
const NGINX_REGEX = /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+["“”'‘’](.*?)["“”'‘’]\s+(\d{3})\s+(\d+|-)$/;

export function parseLogLine(line: string): ParsedLog | null {
  const trimmedLine = line.trim();
  const match = trimmedLine.match(LOG_REGEX);
  if (match) {
    const [, ts, service, levelRaw, message] = match;
    const level = normalizeLevel(levelRaw);

    return {
      timestamp: new Date(ts),
      service,
      level,
      message,
      rawLine: trimmedLine
    };
  }

  const nginxMatch = trimmedLine.match(NGINX_REGEX);
  if (nginxMatch) {
    const [, ip, tsRaw, request, statusCode, bytes] = nginxMatch;
    // tsRaw example: 09/Apr/2026:10:15:32 +0530 -> replace first ':' with ' '
    const ts = tsRaw.replace(':', ' ');
    const parsedDate = new Date(ts);
    
    const code = parseInt(statusCode, 10);
    let level: LogLevel = "INFO";
    if (code >= 500) level = "CRITICAL";
    else if (code >= 400) level = "ERROR";

    return {
      timestamp: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
      service: "nginx",
      level,
      message: `${request} ${statusCode} ${bytes}`,
      rawLine: trimmedLine
    };
  }

  // Debug log to terminal if it still fails so we can see exactly what text the frontend sent
  console.log("🚨 [PARSE_FAILURE]:", JSON.stringify(trimmedLine));
  return null;
}

export function normalizeLevel(level: string): LogLevel {
  const upper = level.toUpperCase();
  if (upper === "CRITICAL" || upper === "FATAL") return "CRITICAL";
  if (upper === "ERROR" || upper === "ERR") return "ERROR";
  if (upper === "WARN" || upper === "WARNING") return "WARN";
  if (upper === "INFO") return "INFO";
  return "DEBUG";
}

export function normalizePattern(message: string): string {
  let normalized = message.trim();
  normalized = normalized.replace(/\d+/g, "<num>");
  normalized = normalized.replace(
    /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b/g,
    "<uuid>"
  );
  normalized = normalized.replace(
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    "<ip>"
  );
  normalized = normalized.replace(/0x[0-9a-fA-F]+/g, "<hex>");
  return normalized;
}

export type IntelligenceLabel =
  | "CONNECTION_TIMEOUT"
  | "CIRCUIT_BREAKER"
  | "DB_UNREACHABLE"
  | "REDIS_POOL_EXHAUSTION"
  | "NULL_POINTER"
  | "UNKNOWN";

export function detectIntelligenceLabel(message: string): IntelligenceLabel {
  const m = message.toLowerCase();
  if (m.includes("timeout") || m.includes("timed out")) {
    return "CONNECTION_TIMEOUT";
  }
  if (m.includes("circuit breaker")) {
    return "CIRCUIT_BREAKER";
  }
  if (m.includes("database is unreachable") || m.includes("db unreachable")) {
    return "DB_UNREACHABLE";
  }
  if (m.includes("redis") && m.includes("pool") && m.includes("exhaust")) {
    return "REDIS_POOL_EXHAUSTION";
  }
  if (m.includes("nullpointer") || m.includes("null pointer")) {
    return "NULL_POINTER";
  }
  return "UNKNOWN";
}

