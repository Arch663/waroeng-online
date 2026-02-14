
import { Router } from "express";
import { pool } from "../db";

const router = Router();

router.get("/", async (_req, res, next) => {
    try {
        const result = await pool.query("SELECT NOW() AS now");
        res.json({ ok: true, dbTime: result.rows[0].now });
    } catch (error) {
        next(error);
    }
});

export default router;
