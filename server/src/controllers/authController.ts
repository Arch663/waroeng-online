
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, getNextId } from "../db";
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

        const user = await db.collection("users").findOne({
            username,
            is_active: true,
        });

        if (!user) {
            res.status(401).send("Invalid username or password.");
            return;
        }

        const valid = await bcrypt.compare(password, String(user.password_hash));

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
                username: String(user.username),
                role: String(user.role),
                full_name: String(user.full_name),
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

        const userDoc = {
            id: await getNextId("users"),
            username,
            password_hash: passwordHash,
            full_name,
            role: userRole,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        };

        await db.collection("users").insertOne(userDoc);
        res.status(201).json({
            id: userDoc.id,
            username: userDoc.username,
            full_name: userDoc.full_name,
            role: userDoc.role,
        });
    } catch (error) {
        next(error);
    }
};
