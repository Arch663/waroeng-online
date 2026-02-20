
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { db, getNextId } from "../db";

export const getSuppliers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { sortBy = "name", order = "ASC" } = req.query;
        const allowedCols = ["name", "contact_person", "phone", "address"];
        const col = allowedCols.includes(String(sortBy))
            ? String(sortBy)
            : "name";
        const ord = String(order).toUpperCase() === "DESC" ? "DESC" : "ASC";

        const sortDir = ord === "DESC" ? -1 : 1;
        const result = await db
            .collection("suppliers")
            .find({}, { projection: { _id: 0 } })
            .sort({ [col]: sortDir })
            .toArray();
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const createSupplier = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { name, contact_person, phone, address } = req.body;
        const supplier = {
            id: await getNextId("suppliers"),
            name,
            contact_person,
            phone,
            address,
            created_at: new Date(),
            updated_at: new Date(),
        };
        await db.collection("suppliers").insertOne(supplier);
        res.status(201).json(supplier);
    } catch (error) {
        next(error);
    }
};

export const updateSupplier = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const id = Number(req.params.id);
        const { name, contact_person, phone, address } = req.body;
        const result = await db.collection("suppliers").findOneAndUpdate(
            { id },
            {
                $set: {
                    name,
                    contact_person,
                    phone,
                    address,
                    updated_at: new Date(),
                },
            },
            { returnDocument: "after", projection: { _id: 0 } },
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const deleteSupplier = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const id = Number(req.params.id);
        await db.collection("suppliers").deleteOne({ id });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
