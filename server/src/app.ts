
import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/errorMiddleware";

const app = express();

const corsOrigin =
    process.env.CORS_ORIGIN?.split(",").map((value) => value.trim()) ?? true;

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.use(routes);

app.use(errorHandler);

export default app;
