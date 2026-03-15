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

export function parseLogLine(line: string): ParsedLog | null {
  const match = line.match(LOG_REGEX);
  if (!match) return null;

  const [, ts, service, levelRaw, message] = match;
  const level = normalizeLevel(levelRaw);

  return {
    timestamp: new Date(ts),
    service,
    level,
    message,
    rawLine: line
  };
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

