import { Request, Response, NextFunction } from "express";

export const errorHandler = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    console.error(error);
    if (error instanceof Error) {
        res.status(400).send(error.message);
        return;
    }
    res.status(500).send("Unexpected server error.");
};
