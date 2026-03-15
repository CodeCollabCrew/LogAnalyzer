import { Router } from "express";
import multer from "multer";
import {
  uploadLogs,
  listLogs,
  analyzeLogsSummary
} from "../controllers/logController";

const upload = multer({ storage: multer.memoryStorage() });

export const logRouter = Router();

logRouter.post(
  "/upload",
  upload.array("files"),
  uploadLogs
);

logRouter.post("/analyze", analyzeLogsSummary);
logRouter.get("/", listLogs);

