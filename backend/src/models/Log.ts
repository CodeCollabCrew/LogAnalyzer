import { Schema, model, Document } from "mongoose";

export type LogLevel = "CRITICAL" | "ERROR" | "WARN" | "INFO" | "DEBUG";

export interface ILog extends Document {
  timestamp: Date;
  service: string;
  level: LogLevel;
  message: string;
  rawLine: string;
}

const LogSchema = new Schema<ILog>(
  {
    timestamp: { type: Date, required: true, index: true },
    service: { type: String, required: true, index: true },
    level: {
      type: String,
      required: true,
      enum: ["CRITICAL", "ERROR", "WARN", "INFO", "DEBUG"]
    },
    message: { type: String, required: true },
    rawLine: { type: String, required: true }
  },
  { timestamps: true }
);

LogSchema.index({ service: 1, level: 1, timestamp: -1 });

export const LogModel = model<ILog>("Log", LogSchema);

