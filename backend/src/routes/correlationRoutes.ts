import { Router } from "express";
import { listCorrelations } from "../controllers/correlationController";

export const correlationRouter = Router();

correlationRouter.get("/", listCorrelations);

