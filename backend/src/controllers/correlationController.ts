import { Request, Response } from "express";
import {
  recomputeCorrelations,
  getCorrelations
} from "../services/correlationService";

export async function listCorrelations(req: Request, res: Response) {
  try {
    const { recompute } = req.query;
    if (recompute === "true") {
      const data = await recomputeCorrelations();
      return res.json({ correlations: data, recomputed: true });
    }
    let data = await getCorrelations();
    // If we have no cached correlations yet, compute them on demand
    // so the UI shows something after the first ingestion.
    if (!data.length) {
      data = await recomputeCorrelations();
      return res.json({ correlations: data, recomputed: true });
    }
    return res.json({ correlations: data, recomputed: false });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch correlations." });
  }
}

