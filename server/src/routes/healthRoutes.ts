
import { Router } from "express";
import { db } from "../db";

const router = Router();

router.get("/", async (_req, res, next) => {
    try {
        const ping = await db.command({ ping: 1 });
        res.json({ ok: ping.ok === 1, dbTime: new Date().toISOString() });
    } catch (error) {
        next(error);
    }
});

export default router;
