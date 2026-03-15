import { Request, Response } from "express";
import { runAIDebug } from "../services/aiService";

export async function aiDebug(req: Request, res: Response) {
  try {
    const { question, service } = req.body as {
      question?: string;
      service?: string;
    };

    if (!question) {
      return res
        .status(400)
        .json({ error: "Question is required." });
    }

    const result = await runAIDebug({ question, service });
    return res.json(result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "AI debugging failed." });
  }
}

