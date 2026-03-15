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

  if (!ENV.GROK_API_KEY) {
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
    "Respond in JSON with keys: rootCause (string), affectedServices (string[]), possibleFixes (string[]), preventionTips (string[]).";

  const userPrompt = `Question from developer: ${question}\n\nLogs:\n${logSnippet}`;

  let content = "{}";

  try {
    const response = await axios.post(
      ENV.GROK_API_URL,
      {
        model: "grok-beta",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${ENV.GROK_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000,
        // Grok sometimes returns useful error bodies on non-2xx;
        // we still want to surface those to the caller.
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
        rootCause: `Grok API returned HTTP ${response.status}.`,
        affectedServices: [],
        possibleFixes: [
          "Verify your GROK_API_KEY and that it has access to the requested model.",
          "Confirm the GROK_API_URL endpoint is correct and reachable from the backend.",
          "Check Grok/xAI dashboard for more details about this request failure."
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
    console.error("Grok API request failed", error);
    content = JSON.stringify({
      rootCause:
        "Failed to reach Grok API from the backend. This is most likely a networking, DNS, or credential issue.",
      affectedServices: [],
      possibleFixes: [
        "Ensure the machine running the backend can reach the GROK_API_URL over the network.",
        "Double-check GROK_API_KEY for typos or expired tokens.",
        "Temporarily disable AI calls in this environment if external egress is blocked."
      ],
      preventionTips: [
        "Use separate API keys and environments for local vs production.",
        "Add a health check endpoint that validates connectivity to Grok."
      ],
      rawError:
        error instanceof Error ? error.message : "Unknown Grok client error"
    });
  }

  let parsed: Partial<AIDebugResponse>;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = {};
  }

  return {
    rootCause:
      parsed.rootCause ||
      "Unable to extract a clear root cause from the AI response.",
    affectedServices: parsed.affectedServices || [],
    possibleFixes: parsed.possibleFixes || [],
    preventionTips: parsed.preventionTips || [],
    rawAnswer: content
  };
}

