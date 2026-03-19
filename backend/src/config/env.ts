import dotenv from "dotenv";
import path from "path";

// Always load the backend .env relative to this file.
// This prevents issues when the server is started from the repo root (cwd mismatch).
const backendEnvPath = path.resolve(__dirname, "../../.env");

const initial = dotenv.config({ path: backendEnvPath });

// If the key didn't load (missing file or empty pre-set env var), try again with override.
if (!process.env.GROK_API_KEY) {
  dotenv.config({ path: backendEnvPath, override: true });
}

// If the backend .env path is missing for some reason, fall back to dotenv's default behavior.
if (initial.error && !process.env.GROK_API_KEY) {
  dotenv.config();
}

export const ENV = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/loglens",
  // AI provider selection:
  // - set AI_PROVIDER=grok to use xAI/Grok
  // - set AI_PROVIDER=groq to use Groq
  AI_PROVIDER:
    process.env.AI_PROVIDER ||
    (process.env.GROQ_API_KEY ? "groq" : "grok"),

  // xAI / Grok (legacy option)
  GROK_API_KEY: process.env.GROK_API_KEY || "",
  GROK_API_URL:
    process.env.GROK_API_URL || "https://api.x.ai/v1/chat/completions",

  // Groq (OpenAI-compatible)
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  GROQ_API_URL:
    process.env.GROQ_API_URL ||
    "https://api.groq.com/openai/v1/chat/completions",
  GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000"
};

