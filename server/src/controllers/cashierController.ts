import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { db, getNextId } from "../db";
import { parseCheckoutItems, createInvoiceNo } from "../utils/helpers";

export const checkout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const checkoutItems = parseCheckoutItems(req.body);
        const paid = Number(req.body.paid);
        const change = Number(req.body.change);
        const itemMap = new Map<number, number>();

        for (const item of checkoutItems) {
            itemMap.set(item.id, (itemMap.get(item.id) ?? 0) + item.qty);
        }

        const inventoryIds = Array.from(itemMap.keys());
        const inventoryRows = await db
            .collection("inventory")
            .find({ id: { $in: inventoryIds } })
            .toArray();

        if (inventoryRows.length !== inventoryIds.length) {
            throw new Error("Some products are no longer available.");
        }

        const inventoryById = new Map(
            inventoryRows.map((row: any) => [
                row.id,
                {
                    id: row.id,
                    name: String(row.name),
                    price: Number(row.price),
                    stock: Number(row.stock),
                },
            ]),
        );

        const normalizedItems = Array.from(itemMap.entries()).map(([id, qty]) => ({ id, qty }));
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
        const saleId = await getNextId("sales");
        const createdAt = new Date();

        await db.collection("sales").insertOne({
            id: saleId,
            invoice_no: invoiceNo,
            total,
            paid,
            change,
            cashier_id: req.user?.id ?? null,
            created_at: createdAt,
        });

        for (const item of saleItems) {
            await db.collection("sale_items").insertOne({
                id: await getNextId("sale_items"),
                sale_id: saleId,
                inventory_id: item.id,
                name: item.name,
                price: item.price,
                qty: item.qty,
                subtotal: item.subtotal,
            });

            await db.collection("stock_movements").insertOne({
                id: await getNextId("stock_movements"),
                inventory_id: item.id,
                movement_type: "sale",
                quantity: -item.qty,
                stock_before: item.stock,
                stock_after: item.stock - item.qty,
                reference_id: saleId,
                reference_type: "sale",
                created_by: req.user?.id ?? null,
                created_at: createdAt,
            });

            await db.collection("inventory").updateOne(
                { id: item.id },
                {
                    $inc: { stock: -item.qty },
                    $set: { updated_at: new Date(), updated_by: req.user?.id ?? null },
                },
            );
        }

        res.status(201).json({
            id: saleId,
            invoiceNo,
            total,
            paid,
            change,
            createdAt,
            items: saleItems,
        });
    } catch (error) {
        next(error);
    }
};
