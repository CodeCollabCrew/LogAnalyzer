import { PatternModel, IPattern } from "../models/Pattern";

export async function getPatterns(): Promise<IPattern[]> {
  return PatternModel.find({})
    .sort({ frequency: -1 })
    .limit(200)
    .lean() as unknown as IPattern[];
}

