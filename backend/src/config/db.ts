import mongoose from "mongoose";
import { ENV } from "./env";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("❌ MongoDB connection error", err);
    process.exit(1);
  }
}

