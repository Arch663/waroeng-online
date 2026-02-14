import dotenv from "dotenv";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { seedDatabase } from "./dbSeeder";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

declare global {
  var _pool: Pool | undefined;
}

export const pool =
  global._pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

if (process.env.NODE_ENV !== "production") {
  global._pool = pool;
}

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cashier',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      sku TEXT UNIQUE,
      name TEXT NOT NULL,
      price NUMERIC(12, 2) NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      category_id INTEGER REFERENCES categories(id),
      category TEXT,
      image TEXT,
      created_by INTEGER REFERENCES users(id),
      updated_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory' AND column_name = 'category_id'
      ) THEN
        ALTER TABLE inventory ADD COLUMN category_id INTEGER REFERENCES categories(id);
      END IF;
    END $$;
  `);

  await pool.query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory' AND column_name = 'created_by'
      ) THEN
        ALTER TABLE inventory ADD COLUMN created_by INTEGER REFERENCES users(id);
      END IF;
    END $$;
  `);

  await pool.query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory' AND column_name = 'updated_by'
      ) THEN
        ALTER TABLE inventory ADD COLUMN updated_by INTEGER REFERENCES users(id);
      END IF;
    END $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      invoice_no TEXT UNIQUE NOT NULL,
      total NUMERIC(12, 2) NOT NULL DEFAULT 0,
      paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
      change NUMERIC(12, 2) NOT NULL DEFAULT 0,
      cashier_id INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales' AND column_name = 'cashier_id'
      ) THEN
        ALTER TABLE sales ADD COLUMN cashier_id INTEGER REFERENCES users(id);
      END IF;
    END $$;
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id SERIAL PRIMARY KEY,
      inventory_id INTEGER NOT NULL REFERENCES inventory(id),
      movement_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      stock_before INTEGER NOT NULL,
      stock_after INTEGER NOT NULL,
      reference_id INTEGER,
      reference_type TEXT,
      notes TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      contact_person TEXT,
      phone TEXT,
      address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
      inventory_id INTEGER NOT NULL REFERENCES inventory(id),
      quantity INTEGER NOT NULL,
      cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
      total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
      notes TEXT,
      created_by INTEGER REFERENCES users(id),
      purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory 
    ON stock_movements(inventory_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at 
    ON stock_movements(created_at);
  `);

  await pool.query(`
    INSERT INTO categories (name, description) 
    VALUES 
      ('Makanan', 'Produk makanan dan camilan'),
      ('Minuman', 'Minuman ringan dan berat'),
      ('Sembako', 'Kebutuhan pokok sehari-hari'),
      ('Alat Tulis', 'Peralatan tulis dan kantor'),
      ('Kesehatan', 'Produk kesehatan dan obat-obatan'),
      ('Lainnya', 'Kategori lainnya')
    ON CONFLICT (name) DO NOTHING;
  `);

  await pool.query(`
    UPDATE inventory i
    SET category_id = (SELECT id FROM categories WHERE name = i.category LIMIT 1)
    WHERE category_id IS NULL AND category IS NOT NULL;
  `);

  await pool.query(`
    ALTER TABLE inventory ALTER COLUMN category DROP NOT NULL;
  `);

  const userCount = await pool.query("SELECT COUNT(*) FROM users");
  if (parseInt(userCount.rows[0].count) === 0) {
    const hashedAdmin = await bcrypt.hash("admin123", 10);
    await pool.query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)`,
      ["admin", hashedAdmin, "Administrator", "admin"],
    );

    const hashedCashier = await bcrypt.hash("kasir123", 10);
    await pool.query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)`,
      ["kasir", hashedCashier, "Kasir Utama", "cashier"],
    );

    console.log("Default users created: admin/admin123 and kasir/kasir123");
  }

  await seedDatabase(pool);
}

export { pool };
