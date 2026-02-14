
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { pool } from "../db";
import { parseCheckoutItems, createInvoiceNo } from "../utils/helpers";

export const checkout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    const client = await pool.connect();

    try {
        const checkoutItems = parseCheckoutItems(req.body);
        const paid = Number(req.body.paid);
        const change = Number(req.body.change);
        const itemMap = new Map<number, number>();

        for (const item of checkoutItems) {
            itemMap.set(item.id, (itemMap.get(item.id) ?? 0) + item.qty);
        }

        const inventoryIds = Array.from(itemMap.keys());

        await client.query("BEGIN");

        const inventoryResult = await client.query<{
            id: number;
            name: string;
            price: string;
            stock: number;
        }>(
            `SELECT id, name, price, stock
       FROM inventory
       WHERE id = ANY($1::int[])
       FOR UPDATE`,
            [inventoryIds],
        );

        if (inventoryResult.rowCount !== inventoryIds.length) {
            throw new Error("Some products are no longer available.");
        }

        const inventoryById = new Map(
            inventoryResult.rows.map((row) => [
                row.id,
                {
                    id: row.id,
                    name: row.name,
                    price: Number(row.price),
                    stock: Number(row.stock),
                },
            ]),
        );

        const normalizedItems = Array.from(itemMap.entries()).map(([id, qty]) => ({
            id,
            qty,
        }));

        const saleItems = normalizedItems.map((item) => {
            const inventory = inventoryById.get(item.id);
            if (!inventory) {
                throw new Error("Some products are no longer available.");
            }
            if (item.qty > inventory.stock) {
                throw new Error(`Stock ${inventory.name} tidak mencukupi.`);
            }

            return {
                ...inventory,
                qty: item.qty,
                subtotal: inventory.price * item.qty,
            };
        });

        const total = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
        const invoiceNo = createInvoiceNo(new Date());

        const saleResult = await client.query<{
            id: number;
            invoice_no: string;
            total: string;
            paid: string;
            change: string;
            created_at: string;
        }>(
            `INSERT INTO sales (invoice_no, total, paid, change, cashier_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, invoice_no, total, paid, change, created_at`,
            [invoiceNo, total, paid, change, req.user?.id ?? null],
        );

        const sale = saleResult.rows[0];

        for (const item of saleItems) {
            await client.query(
                `INSERT INTO stock_movements (inventory_id, movement_type, quantity, stock_before, stock_after, reference_id, reference_type, created_by)
         VALUES ($1, 'sale', $2, $3, $4, $5, 'sale', $6)`,
                [
                    item.id,
                    -item.qty,
                    item.stock,
                    item.stock - item.qty,
                    sale.id,
                    req.user?.id ?? null,
                ],
            );

            await client.query(
                `INSERT INTO sale_items (sale_id, inventory_id, name, price, qty, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [sale.id, item.id, item.name, item.price, item.qty, item.subtotal],
            );

            await client.query(
                "UPDATE inventory SET stock = stock - $1, updated_at = NOW() WHERE id = $2",
                [item.qty, item.id],
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            id: sale.id,
            invoiceNo: sale.invoice_no,
            total: Number(sale.total),
            paid: Number(sale.paid),
            change: Number(sale.change),
            createdAt: sale.created_at,
            items: saleItems,
        });
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
};
