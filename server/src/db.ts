import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST ?? "localhost",
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD ?? "",
  database: process.env.PGDATABASE ?? "postgres",
});

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      sku TEXT UNIQUE,
      name TEXT NOT NULL,
      price NUMERIC(12, 2) NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL DEFAULT 'Lainnya',
      image TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      invoice_no TEXT UNIQUE NOT NULL,
      total NUMERIC(12, 2) NOT NULL DEFAULT 0,
      paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
      change NUMERIC(12, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      inventory_id INTEGER NOT NULL REFERENCES inventory(id),
      name TEXT NOT NULL,
      price NUMERIC(12, 2) NOT NULL DEFAULT 0,
      qty INTEGER NOT NULL DEFAULT 1,
      subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0
    );
  `);
}

export { pool };
