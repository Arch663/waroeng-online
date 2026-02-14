
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { pool } from "../db";
import { parsePayload } from "../utils/helpers";

export const getInventory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const {
            q,
            page = "1",
            limit = "10",
            category_id,
            sortBy = "id",
            order = "DESC",
        } = req.query;
        const search = q ? String(q).trim() : "";
        const p = Math.max(1, Number(page));
        const l = Math.max(1, Number(limit));
        const offset = (p - 1) * l;

        const allowedSortColumns = [
            "id",
            "sku",
            "name",
            "price",
            "stock",
            "category",
        ];
        const sortCol = allowedSortColumns.includes(String(sortBy))
            ? String(sortBy)
            : "id";
        const sortOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

        let queryBase = `
      FROM inventory i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE 1=1
    `;
        const params: any[] = [];

        if (search) {
            params.push(`%${search}%`);
            queryBase += ` AND (i.sku ILIKE $${params.length} OR i.name ILIKE $${params.length})`;
        }

        if (category_id) {
            params.push(Number(category_id));
            queryBase += ` AND i.category_id = $${params.length}`;
        }

        const countQuery = `SELECT COUNT(*) ${queryBase}`;
        const countResult = await pool.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count);

        let query = `
      SELECT 
        i.id, i.sku, i.name, i.price, i.stock, 
        i.category_id, 
        COALESCE(c.name, i.category, 'Lainnya') as category, 
        i.image 
      ${queryBase}
      ORDER BY ${sortCol === "category" ? "COALESCE(c.name, i.category)" : "i." + sortCol} ${sortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
        params.push(l, offset);

        const result = await pool.query(query, params);

        res.json({
            items: result.rows,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / l),
                currentPage: p,
                limit: l,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const createInventory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    const client = await pool.connect();
    try {
        const payload = parsePayload(req.body);
        await client.query("BEGIN");

        const result = await client.query(
            `INSERT INTO inventory (sku, name, price, stock, category_id, category, image, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, sku, name, price, stock, category_id, category, image`,
            [
                payload.sku ?? null,
                payload.name,
                payload.price,
                payload.stock,
                payload.category_id ?? null,
                payload.category ?? null,
                payload.image ?? null,
                req.user?.id ?? null,
            ],
        );

        const newItem = result.rows[0];

        if (newItem.stock > 0) {
            await client.query(
                `INSERT INTO stock_movements (inventory_id, movement_type, quantity, stock_before, stock_after, notes, created_by)
         VALUES ($1, 'adjustment', $2, 0, $3, 'Stok awal saat input barang baru', $4)`,
                [newItem.id, newItem.stock, newItem.stock, req.user?.id ?? null],
            );
        }

        await client.query("COMMIT");
        res.status(201).json(newItem);
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
};

export const updateInventory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    const client = await pool.connect();
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).send("Invalid inventory id.");
            return;
        }

        const payload = parsePayload(req.body);
        await client.query("BEGIN");

        const currentRes = await client.query(
            "SELECT stock FROM inventory WHERE id = $1 FOR UPDATE",
            [id],
        );
        if (currentRes.rowCount === 0) {
            res.status(404).send("Inventory item not found.");
            return;
        }
        const oldStock = Number(currentRes.rows[0].stock);

        const result = await client.query(
            `UPDATE inventory
       SET sku = $1, name = $2, price = $3, stock = $4, category_id = $5, category = $6, image = $7, updated_by = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING id, sku, name, price, stock, category_id, category, image`,
            [
                payload.sku ?? null,
                payload.name,
                payload.price,
                payload.stock,
                payload.category_id ?? null,
                payload.category ?? null,
                payload.image ?? null,
                req.user?.id ?? null,
                id,
            ],
        );

        const updatedItem = result.rows[0];

        if (oldStock !== updatedItem.stock) {
            await client.query(
                `INSERT INTO stock_movements (inventory_id, movement_type, quantity, stock_before, stock_after, notes, created_by)
         VALUES ($1, 'adjustment', $2, $3, $4, 'Penyesuaian stok manual', $5)`,
                [
                    id,
                    updatedItem.stock - oldStock,
                    oldStock,
                    updatedItem.stock,
                    req.user?.id ?? null,
                ],
            );
        }

        await client.query("COMMIT");
        res.json(updatedItem);
    } catch (error) {
        if (client) await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
};

export const deleteInventory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).send("Invalid inventory id.");
            return;
        }

        const result = await pool.query("DELETE FROM inventory WHERE id = $1", [
            id,
        ]);
        if (!result.rowCount) {
            res.status(404).send("Inventory item not found.");
            return;
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const getInventoryMovements = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const id = Number(req.params.id);
        const result = await pool.query(
            `SELECT 
        sm.id, sm.movement_type, sm.quantity, sm.stock_before, sm.stock_after, 
        sm.notes, sm.created_at, u.full_name as created_by_name
       FROM stock_movements sm
       LEFT JOIN users u ON sm.created_by = u.id
       WHERE sm.inventory_id = $1
       ORDER BY sm.created_at DESC`,
            [id],
        );
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};
