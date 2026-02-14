
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { pool } from "../db";

export const getPurchases = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await pool.query(`
    SELECT p.*, s.name as supplier_name, i.name as product_name, u.full_name as created_by_name
    FROM purchases p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    LEFT JOIN inventory i ON p.inventory_id = i.id
    LEFT JOIN users u ON p.created_by = u.id
    ORDER BY p.purchase_date DESC
  `);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

export const createPurchase = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    const client = await pool.connect();
    try {
        const { supplier_id, inventory_id, quantity, cost_price, notes } =
            req.body;
        await client.query("BEGIN");

        const invRes = await client.query(
            "SELECT stock FROM inventory WHERE id = $1 FOR UPDATE",
            [inventory_id],
        );
        if (invRes.rowCount === 0) throw new Error("Inventory item not found.");
        const oldStock = Number(invRes.rows[0].stock);

        const result = await client.query(
            `INSERT INTO purchases (supplier_id, inventory_id, quantity, cost_price, total_cost, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                supplier_id,
                inventory_id,
                quantity,
                cost_price,
                quantity * cost_price,
                notes,
                req.user?.id,
            ],
        );

        const purchase = result.rows[0];

        await client.query(
            "UPDATE inventory SET stock = stock + $1, updated_at = NOW() WHERE id = $2",
            [quantity, inventory_id],
        );

        await client.query(
            `INSERT INTO stock_movements (inventory_id, movement_type, quantity, stock_before, stock_after, reference_id, reference_type, notes, created_by)
       VALUES ($1, 'purchase', $2, $3, $4, $5, 'purchase', $6, $7)`,
            [
                inventory_id,
                quantity,
                oldStock,
                oldStock + quantity,
                purchase.id,
                notes || "Pembelian barang",
                req.user?.id,
            ],
        );

        await client.query("COMMIT");
        res.status(201).json(purchase);
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
};
