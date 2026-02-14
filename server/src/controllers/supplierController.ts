
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { pool } from "../db";

export const getSuppliers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { sortBy = "name", order = "ASC" } = req.query;
        const allowedCols = ["name", "contact_person", "phone", "address"];
        const col = allowedCols.includes(String(sortBy))
            ? String(sortBy)
            : "name";
        const ord = String(order).toUpperCase() === "DESC" ? "DESC" : "ASC";

        const result = await pool.query(
            `SELECT * FROM suppliers ORDER BY ${col} ${ord}`,
        );
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

export const createSupplier = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { name, contact_person, phone, address } = req.body;
        const result = await pool.query(
            `INSERT INTO suppliers (name, contact_person, phone, address) VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, contact_person, phone, address],
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

export const updateSupplier = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const id = Number(req.params.id);
        const { name, contact_person, phone, address } = req.body;
        const result = await pool.query(
            `UPDATE suppliers SET name = $1, contact_person = $2, phone = $3, address = $4, updated_at = NOW() WHERE id = $5 RETURNING *`,
            [name, contact_person, phone, address, id],
        );
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

export const deleteSupplier = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const id = Number(req.params.id);
        await pool.query("DELETE FROM suppliers WHERE id = $1", [id]);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
