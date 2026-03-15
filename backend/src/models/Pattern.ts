import { Schema, model, Document } from "mongoose";

export interface IPattern extends Document {
  pattern: string;
  frequency: number;
  example: string;
}

const PatternSchema = new Schema<IPattern>(
  {
    pattern: { type: String, required: true, unique: true },
    frequency: { type: Number, required: true, default: 0 },
    example: { type: String, required: true }
  },
  { timestamps: true }
);

export const PatternModel = model<IPattern>("Pattern", PatternSchema);

