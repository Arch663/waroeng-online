import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

dotenv.config();

const mongoUri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB_NAME ?? "waroeng";

export const mongoClient = new MongoClient(mongoUri);
export const db = mongoClient.db(dbName);

type CounterDoc = {
    _id: string;
    seq: number;
};

async function nextSequence(name: string) {
    const result = await db.collection<CounterDoc>("counters").findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
    );
    return Number(result?.seq ?? 1);
}

export async function getNextId(name: string) {
    return nextSequence(name);
}

async function ensureDefaults() {
    const categories = db.collection("categories");
    const users = db.collection("users");

    const categorySeeds = [
        { name: "Makanan", description: "Produk makanan dan camilan" },
        { name: "Minuman", description: "Minuman ringan dan berat" },
        { name: "Sembako", description: "Kebutuhan pokok sehari-hari" },
        { name: "Alat Tulis", description: "Peralatan tulis dan kantor" },
        { name: "Kesehatan", description: "Produk kesehatan dan obat-obatan" },
        { name: "Lainnya", description: "Kategori lainnya" },
    ];

    for (const category of categorySeeds) {
        const existing = await categories.findOne({ name: category.name });
        if (!existing) {
            await categories.insertOne({
                id: await nextSequence("categories"),
                ...category,
                created_at: new Date(),
            });
        }
    }

    const admin = await users.findOne({ username: "admin" });
    if (!admin) {
        await users.insertOne({
            id: await nextSequence("users"),
            username: "admin",
            password_hash: await bcrypt.hash("admin123", 10),
            full_name: "Administrator",
            role: "admin",
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        });
    }

    const cashier = await users.findOne({ username: "kasir" });
    if (!cashier) {
        await users.insertOne({
            id: await nextSequence("users"),
            username: "kasir",
            password_hash: await bcrypt.hash("kasir123", 10),
            full_name: "Kasir Utama",
            role: "cashier",
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        });
    }
}

export async function initializeDatabase() {
    await mongoClient.connect();

    await Promise.all([
        db.collection("users").createIndex({ username: 1 }, { unique: true }),
        db.collection("categories").createIndex({ name: 1 }, { unique: true }),
        db.collection("inventory").createIndex({ sku: 1 }, { unique: true, sparse: true }),
        db.collection("suppliers").createIndex({ name: 1 }, { unique: true }),
        db.collection("sales").createIndex({ invoice_no: 1 }, { unique: true }),
    ]);

    await ensureDefaults();
}
