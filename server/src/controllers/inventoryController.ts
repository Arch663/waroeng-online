import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { db, getNextId } from "../db";
import { parsePayload } from "../utils/helpers";

export const getInventory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { q, page = "1", limit = "10", category_id, sortBy = "id", order = "DESC" } = req.query;
        const search = q ? String(q).trim() : "";
        const p = Math.max(1, Number(page));
        const l = Math.max(1, Number(limit));
        const allowedSortColumns = ["id", "sku", "name", "price", "stock", "category"];
        const sortCol = allowedSortColumns.includes(String(sortBy)) ? String(sortBy) : "id";
        const sortOrder = String(order).toUpperCase() === "ASC" ? 1 : -1;

        const filter: Record<string, unknown> = {};
        if (search) {
            filter.$or = [{ sku: { $regex: search, $options: "i" } }, { name: { $regex: search, $options: "i" } }];
        }
        if (category_id) {
            filter.category_id = Number(category_id);
        }

        const totalItems = await db.collection("inventory").countDocuments(filter);
        const items = await db
            .collection("inventory")
            .find(filter, {
                projection: {
                    _id: 0,
                    id: 1,
                    sku: 1,
                    name: 1,
                    price: 1,
                    stock: 1,
                    category_id: 1,
                    category: 1,
                    image: 1,
                },
            })
            .sort({ [sortCol]: sortOrder })
            .skip((p - 1) * l)
            .limit(l)
            .toArray();

        res.json({
            items: items.map((item: any) => ({
                ...item,
                category: item.category ?? "Lainnya",
            })),
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

export const createInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const payload = parsePayload(req.body);
        const category =
            payload.category ??
            (await db.collection("categories").findOne({ id: payload.category_id }, { projection: { name: 1 } }))?.name ??
            "Lainnya";

        const newItem = {
            id: await getNextId("inventory"),
            sku: payload.sku ?? null,
            name: payload.name,
            price: payload.price,
            stock: payload.stock,
            category_id: payload.category_id ?? null,
            category,
            image: payload.image ?? null,
            created_by: req.user?.id ?? null,
            updated_by: req.user?.id ?? null,
            created_at: new Date(),
            updated_at: new Date(),
        };

        await db.collection("inventory").insertOne(newItem);

        if (newItem.stock > 0) {
            await db.collection("stock_movements").insertOne({
                id: await getNextId("stock_movements"),
                inventory_id: newItem.id,
                movement_type: "adjustment",
                quantity: newItem.stock,
                stock_before: 0,
                stock_after: newItem.stock,
                notes: "Stok awal saat input barang baru",
                created_by: req.user?.id ?? null,
                created_at: new Date(),
            });
        }

        res.status(201).json({
            id: newItem.id,
            sku: newItem.sku,
            name: newItem.name,
            price: newItem.price,
            stock: newItem.stock,
            category_id: newItem.category_id,
            category: newItem.category,
            image: newItem.image,
        });
    } catch (error) {
        next(error);
    }
};

export const updateInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).send("Invalid inventory id.");
            return;
        }

        const payload = parsePayload(req.body);
        const existing = await db.collection("inventory").findOne({ id });
        if (!existing) {
            res.status(404).send("Inventory item not found.");
            return;
        }

        const oldStock = Number(existing.stock ?? 0);
        const category =
            payload.category ??
            (await db.collection("categories").findOne({ id: payload.category_id }, { projection: { name: 1 } }))?.name ??
            "Lainnya";

        await db.collection("inventory").updateOne(
            { id },
            {
                $set: {
                    sku: payload.sku ?? null,
                    name: payload.name,
                    price: payload.price,
                    stock: payload.stock,
                    category_id: payload.category_id ?? null,
                    category,
                    image: payload.image ?? null,
                    updated_by: req.user?.id ?? null,
                    updated_at: new Date(),
                },
            },
        );

        if (oldStock !== payload.stock) {
            await db.collection("stock_movements").insertOne({
                id: await getNextId("stock_movements"),
                inventory_id: id,
                movement_type: "adjustment",
                quantity: payload.stock - oldStock,
                stock_before: oldStock,
                stock_after: payload.stock,
                notes: "Penyesuaian stok manual",
                created_by: req.user?.id ?? null,
                created_at: new Date(),
            });
        }

        res.json({
            id,
            sku: payload.sku ?? null,
            name: payload.name,
            price: payload.price,
            stock: payload.stock,
            category_id: payload.category_id ?? null,
            category,
            image: payload.image ?? null,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).send("Invalid inventory id.");
            return;
        }

        const inSaleItems = await db.collection("sale_items").findOne({ inventory_id: id }, { projection: { _id: 1 } });
        const inPurchases = await db.collection("purchases").findOne({ inventory_id: id }, { projection: { _id: 1 } });
        if (inSaleItems || inPurchases) {
            throw new Error("Inventory item cannot be deleted because it has transactions.");
        }

        const result = await db.collection("inventory").deleteOne({ id });
        if (!result.deletedCount) {
            res.status(404).send("Inventory item not found.");
            return;
        }

        await db.collection("stock_movements").deleteMany({ inventory_id: id });
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
        const movements = await db
            .collection("stock_movements")
            .find({ inventory_id: id }, { projection: { _id: 0 } })
            .sort({ created_at: -1 })
            .toArray();

        const userIds = Array.from(new Set(movements.map((m: any) => m.created_by).filter(Boolean)));
        const users = await db
            .collection("users")
            .find({ id: { $in: userIds } }, { projection: { _id: 0, id: 1, full_name: 1 } })
            .toArray();
        const userMap = new Map(users.map((u: any) => [u.id, u.full_name]));

        res.json(
            movements.map((m: any) => ({
                ...m,
                created_by_name: m.created_by ? userMap.get(m.created_by) ?? null : null,
            })),
        );
    } catch (error) {
        next(error);
    }
};
