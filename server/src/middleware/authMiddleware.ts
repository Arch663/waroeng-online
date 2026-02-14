
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "waroeng_super_secret_key_2026";

export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        role: string;
        full_name: string;
    };
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).send("Authentication required.");
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send("Invalid or expired token.");
    }
};

export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res
                .status(403)
                .send("You don't have permission to access this resource.");
            return;
        }
        next();
    };
};
