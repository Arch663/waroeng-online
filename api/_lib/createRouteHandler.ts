import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import type { Router } from "express";
import { errorHandler } from "../../server/src/middleware/errorMiddleware";
import { ensureDatabaseInitialized } from "../../server/src/db";

dotenv.config();

const corsOrigin =
  process.env.CORS_ORIGIN?.split(",").map((value) => value.trim()) ?? true;

export function createRouteHandler(basePath: string, router: Router) {
  const app = express();
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());
  app.use(basePath, router);
  app.use(errorHandler);

  return async function handler(req: any, res: any) {
    await ensureDatabaseInitialized();
    if (req.url) {
      req.url = req.url.replace(/^\/api/, "") || "/";
    }
    return app(req, res);
  };
}
