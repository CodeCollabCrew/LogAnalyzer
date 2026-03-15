import { Router } from "express";
import { listPatterns } from "../controllers/patternController";

export const patternRouter = Router();

patternRouter.get("/", listPatterns);

