import { Request, Response } from "express";
import { getPatterns } from "../services/patternService";

export async function listPatterns(req: Request, res: Response) {
  try {
    const patterns = await getPatterns();
    return res.json({ patterns });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch patterns." });
  }
}

