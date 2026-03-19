import axios from "axios";
import { ENV } from "../config/env";
import { LogModel } from "../models/Log";

export interface AIDebugRequest {
  question: string;
  service?: string;
}

export interface AIDebugResponse {
  rootCause: string;
  affectedServices: string[];
  possibleFixes: string[];
  preventionTips: string[];
  rawAnswer: string;
}

export async function runAIDebug(
  payload: AIDebugRequest
): Promise<AIDebugResponse> {
  const { question, service } = payload;

  const logs = await LogModel.find(
    service ? { service } : {},
    null,
    { sort: { timestamp: -1 }, limit: 200 }
  ).lean();

  const logSnippet = logs
    .map(
      (l) =>
        `${l.timestamp.toISOString()} [${l.service}] ${l.level} ${l.message}`
    )
    .join("\n")
    .slice(0, 8000);

  const provider = ENV.AI_PROVIDER;
  const isGroq = provider.toLowerCase() === "groq";

  // Provider configuration guardrails (so `/ai/debug` returns actionable errors).
  if (isGroq && !ENV.GROQ_API_KEY) {
    return {
      rootCause:
        "Groq API key is not configured. Set GROQ_API_KEY in backend environment.",
      affectedServices: [],
      possibleFixes: [
        "Configure GROQ_API_KEY and GROQ_API_URL in the backend .env file.",
        "Restart the backend server after setting environment variables."
      ],
      preventionTips: [
        "Use environment variable management for local and production.",
        "Add health checks for AI dependency."
      ],
      rawAnswer: ""
    };
  }

  if (!isGroq && !ENV.GROK_API_KEY) {
    return {
      rootCause:
        "Grok API key is not configured. Set GROK_API_KEY in backend environment.",
      affectedServices: [],
      possibleFixes: [
        "Configure GROK_API_KEY and GROK_API_URL in the backend .env file.",
        "Restart the backend server after setting environment variables."
      ],
      preventionTips: [
        "Use environment variable management for local and production.",
        "Add health checks for AI dependency."
      ],
      rawAnswer: ""
    };
  }

  const systemPrompt =
    "You are LogLens, an expert production incident responder.\n" +
    "Analyze the following system logs. Identify the main failures, root causes, affected services, and suggest concrete fixes and prevention tips.\n" +
    "Respond with ONLY valid JSON (no markdown/code fences).\n" +
    "Use these exact keys and types: rootCause (string), affectedServices (string[]), possibleFixes (string[]), preventionTips (string[]).";

  const userPrompt = `Question from developer: ${question}\n\nLogs:\n${logSnippet}`;

  let content = "{}";

  try {
    const response = await axios.post(
      isGroq ? ENV.GROQ_API_URL : ENV.GROK_API_URL,
      {
        model: isGroq ? ENV.GROQ_MODEL : "grok-3-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      },
      {
        headers: {
          Authorization: isGroq
            ? `Bearer ${ENV.GROQ_API_KEY}`
            : `Bearer ${ENV.GROK_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000,
        // Surface error bodies from the provider (4xx/5xx) so the UI can show details.
        validateStatus: () => true
      }
    );

    if (response.status >= 200 && response.status < 300) {
      content = response.data?.choices?.[0]?.message?.content || "{}";
    } else {
      const errorSummary =
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data);
      content = JSON.stringify({
        rootCause: `${isGroq ? "Groq" : "Grok"} API returned HTTP ${response.status}.`,
        affectedServices: [],
        possibleFixes: [
          `Verify your ${isGroq ? "GROQ_API_KEY" : "GROK_API_KEY"} has access to the requested model.`,
          `Confirm the ${isGroq ? "GROQ_API_URL" : "GROK_API_URL"} endpoint is correct and reachable from the backend.`,
          `Check the ${isGroq ? "Groq" : "Grok/xAI"} dashboard for more details about this request failure.`
        ],
        preventionTips: [
          "Add monitoring around external AI calls and fallback paths.",
          "Handle 4xx/5xx responses gracefully in the application layer."
        ],
        rawError: errorSummary
      });
    }
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("AI API request failed", error);
    content = JSON.stringify({
      rootCause:
        `Failed to reach ${isGroq ? "Groq" : "Grok"} API from the backend. This is most likely a networking, DNS, or credential issue.`,
      affectedServices: [],
      possibleFixes: [
        `Ensure the machine running the backend can reach the ${isGroq ? "GROQ_API_URL" : "GROK_API_URL"} over the network.`,
        `Double-check ${isGroq ? "GROQ_API_KEY" : "GROK_API_KEY"} for typos or expired tokens.`,
        "Temporarily disable AI calls in this environment if external egress is blocked."
      ],
      preventionTips: [
        "Use separate API keys and environments for local vs production.",
        `Add a health check endpoint that validates connectivity to ${isGroq ? "Groq" : "Grok"}.`
      ],
      rawError:
        error instanceof Error ? error.message : "Unknown AI client error"
    });
  }

  // Groq/xAI may wrap JSON in markdown code fences. Try a few strategies to extract JSON.
  const tryParseJson = (raw: string): Partial<AIDebugResponse> | null => {
    try {
      return JSON.parse(raw) as Partial<AIDebugResponse>;
    } catch {
      return null;
    }
  };

  let parsed: Partial<AIDebugResponse> | null = tryParseJson(content);
  if (!parsed) {
    const trimmed = content.trim();

    // Strip ```json ... ``` fences if present.
    const withoutFences = trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    parsed = tryParseJson(withoutFences);

    // As a last resort, extract the first {...} block.
    if (!parsed) {
      const match = withoutFences.match(/\{[\s\S]*\}/);
      if (match) parsed = tryParseJson(match[0]);
    }
  }

  const normalizeString = (v: unknown): string => {
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v.filter((x) => typeof x === "string").join(", ");
    return "";
  };

  const normalizeStringArray = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
    return [];
  };

  return {
    rootCause:
      (parsed ? normalizeString((parsed as any).rootCause) : "") ||
      "Unable to extract a clear root cause from the AI response.",
    affectedServices: normalizeStringArray((parsed as any)?.affectedServices),
    possibleFixes: normalizeStringArray((parsed as any)?.possibleFixes),
    preventionTips: normalizeStringArray((parsed as any)?.preventionTips),
    rawAnswer: content
  };
}

