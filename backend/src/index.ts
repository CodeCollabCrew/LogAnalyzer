import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";
import { apiRouter } from "./routes";
import { exampleLogs } from "./data/exampleLogs";

async function bootstrap() {
  await connectDB();

  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: ENV.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(morgan("dev"));

  app.get("/", (_req, res) => {
    res.send("LogLens API is running!");
  });

  // Trigger restart for CORS (port 3000)
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/example-logs", (_req, res) => {
    res.type("text/plain").send(exampleLogs.trim());
  });

  app.use("/api", apiRouter);

  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      // eslint-disable-next-line no-console
      console.error("Unhandled error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  );

  app.listen(ENV.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 LogLens backend listening on port ${ENV.PORT}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", err);
  process.exit(1);
});

