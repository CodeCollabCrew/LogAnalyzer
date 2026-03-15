import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/loglens",
  GROK_API_KEY: process.env.GROK_API_KEY || "",
  GROK_API_URL:
    process.env.GROK_API_URL || "https://api.x.ai/v1/chat/completions",
  
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000"
};

