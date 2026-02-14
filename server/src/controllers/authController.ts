
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db";
import { AuthRequest } from "../middleware/authMiddleware";

const JWT_SECRET = process.env.JWT_SECRET || "waroeng_super_secret_key_2026";

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new Error("Username and password are required.");
        }

        const result = await pool.query(
            "SELECT id, username, password_hash, full_name, role FROM users WHERE username = $1 AND is_active = true",
            [username],
        );

        if (result.rowCount === 0) {
            res.status(401).send("Invalid username or password.");
            return;
        }

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) {
            res.status(401).send("Invalid username or password.");
            return;
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                full_name: user.full_name,
            },
            JWT_SECRET,
            { expiresIn: "1d" },
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                full_name: user.full_name,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const me = (req: AuthRequest, res: Response) => {
    res.json(req.user);
};

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { username, password, full_name, role } = req.body;

        if (!username || !password || !full_name) {
            throw new Error("Username, password, and full name are required.");
        }

        // Default role to 'staff' if not provided or restricted
        const userRole = role && ["admin", "manager", "cashier", "staff"].includes(role) ? role : "staff";

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (username, password_hash, full_name, role, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id, username, full_name, role",
            [username, passwordHash, full_name, userRole]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};
