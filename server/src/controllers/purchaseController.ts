import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { db, getNextId } from "../db";

export const getPurchases = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const purchases = await db.collection("purchases").find({}, { projection: { _id: 0 } }).sort({ purchase_date: -1 }).toArray();
        const supplierIds = Array.from(new Set(purchases.map((p: any) => p.supplier_id)));
        const productIds = Array.from(new Set(purchases.map((p: any) => p.inventory_id)));
        const userIds = Array.from(new Set(purchases.map((p: any) => p.created_by).filter(Boolean)));

        const [suppliers, inventory, users] = await Promise.all([
            db.collection("suppliers").find({ id: { $in: supplierIds } }, { projection: { _id: 0, id: 1, name: 1 } }).toArray(),
            db.collection("inventory").find({ id: { $in: productIds } }, { projection: { _id: 0, id: 1, name: 1 } }).toArray(),
            db.collection("users").find({ id: { $in: userIds } }, { projection: { _id: 0, id: 1, full_name: 1 } }).toArray(),
        ]);

        const supplierMap = new Map(suppliers.map((s: any) => [s.id, s.name]));
        const productMap = new Map(inventory.map((i: any) => [i.id, i.name]));
        const userMap = new Map(users.map((u: any) => [u.id, u.full_name]));

        res.json(
            purchases.map((p: any) => ({
                ...p,
                supplier_name: supplierMap.get(p.supplier_id) ?? null,
                product_name: productMap.get(p.inventory_id) ?? null,
                created_by_name: p.created_by ? userMap.get(p.created_by) ?? null : null,
            })),
        );
    } catch (error) {
        next(error);
    }
};

export const createPurchase = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { supplier_id, inventory_id, quantity, cost_price, notes } = req.body;
        const inv = await db.collection("inventory").findOne({ id: Number(inventory_id) });
        if (!inv) throw new Error("Inventory item not found.");

        const oldStock = Number(inv.stock);
        const parsedQty = Number(quantity);
        const parsedCostPrice = Number(cost_price);
        const purchase = {
            id: await getNextId("purchases"),
            supplier_id: Number(supplier_id),
            inventory_id: Number(inventory_id),
            quantity: parsedQty,
            cost_price: parsedCostPrice,
            total_cost: parsedQty * parsedCostPrice,
            notes,
            created_by: req.user?.id ?? null,
            purchase_date: new Date(),
        };

        await db.collection("purchases").insertOne(purchase);
        await db.collection("inventory").updateOne(
            { id: Number(inventory_id) },
            { $inc: { stock: parsedQty }, $set: { updated_at: new Date(), updated_by: req.user?.id ?? null } },
        );
        await db.collection("stock_movements").insertOne({
            id: await getNextId("stock_movements"),
            inventory_id: Number(inventory_id),
            movement_type: "purchase",
            quantity: parsedQty,
            stock_before: oldStock,
            stock_after: oldStock + parsedQty,
            reference_id: purchase.id,
            reference_type: "purchase",
            notes: notes || "Pembelian barang",
            created_by: req.user?.id ?? null,
            created_at: new Date(),
        });

        res.status(201).json(purchase);
    } catch (error) {
        next(error);
    }
};
