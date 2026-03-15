import { Router } from "express";
import { logRouter } from "./logRoutes";
import { patternRouter } from "./patternRoutes";
import { correlationRouter } from "./correlationRoutes";
import { aiRouter } from "./aiRoutes";

export const apiRouter = Router();

apiRouter.use("/logs", logRouter);
apiRouter.use("/patterns", patternRouter);
apiRouter.use("/correlations", correlationRouter);
apiRouter.use("/ai", aiRouter);

