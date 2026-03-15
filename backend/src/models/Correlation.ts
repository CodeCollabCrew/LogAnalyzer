import { Schema, model, Document } from "mongoose";

export interface ICorrelation extends Document {
  serviceA: string;
  serviceB: string;
  count: number;
}

const CorrelationSchema = new Schema<ICorrelation>(
  {
    serviceA: { type: String, required: true },
    serviceB: { type: String, required: true },
    count: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

CorrelationSchema.index({ serviceA: 1, serviceB: 1 }, { unique: true });

export const CorrelationModel = model<ICorrelation>(
  "Correlation",
  CorrelationSchema
);

