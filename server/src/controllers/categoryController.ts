import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { pool } from "../db";

export const getCategories = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await pool.query(
            "SELECT id, name, description FROM categories ORDER BY name ASC",
        );
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};
