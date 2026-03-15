import { Router } from "express";
import { aiDebug } from "../controllers/aiController";

export const aiRouter = Router();

aiRouter.post("/debug", aiDebug);

