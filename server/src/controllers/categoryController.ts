import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { db } from "../db";

export const getCategories = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await db
            .collection("categories")
            .find({}, { projection: { _id: 0, id: 1, name: 1, description: 1 } })
            .sort({ name: 1 })
            .toArray();
        res.json(result);
    } catch (error) {
        next(error);
    }
};
