import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { initializeDatabase, pool } from "./db";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);
const corsOrigin = process.env.CORS_ORIGIN?.split(",").map((value) => value.trim()) ?? true;

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

interface InventoryPayload {
  name: string;
  price: number;
  stock: number;
  category: string;
  sku?: string;
  image?: string;
}

interface CheckoutItemPayload {
  id: number;
  qty: number;
}

function parsePayload(raw: unknown): InventoryPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("Request body must be a JSON object.");
  }

  const body = raw as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const price = Number(body.price ?? 0);
  const stock = Number(body.stock ?? 0);
  const category = String(body.category ?? "").trim();
  const sku = body.sku ? String(body.sku).trim() : undefined;
  const image = body.image ? String(body.image).trim() : undefined;

  if (!sku) {
    throw new Error("Sku barang tidak boleh kosong.");
  }
  if (!name) {
    throw new Error("Nama barang tidak boleh kosong.");
  }
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("harga barang tidak boleh kurang dari sama dengan 0.");
  }
  if (!Number.isInteger(stock) || stock <= 0) {
    throw new Error("stok barang tidak boleh kosong.");
  }
  if (!category) {
    throw new Error("Categori tidak boleh kosong");
  }

  return { name, price, stock, category, sku, image };
}

function parseCheckoutItems(raw: unknown): CheckoutItemPayload[] {
  if (!raw || typeof raw !== "object") {
    throw new Error("Request body must be a JSON object.");
  }

  const body = raw as Record<string, unknown>;
  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new Error("`items` is required and must be a non-empty array.");
  }

  return body.items.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`items[${index}] must be an object.`);
    }

    const row = item as Record<string, unknown>;
    const id = Number(row.id);
    const qty = Number(row.qty);

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`items[${index}].id must be a positive integer.`);
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new Error(`items[${index}].qty must be a positive integer.`);
    }

    return { id, qty };
  });
}

function createInvoiceNo(now: Date) {
  const yyyy = now.getFullYear().toString();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `TRX-${yyyy}${mm}${dd}-${hh}${mi}${ss}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}

app.get("/health", async (_req, res, next) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json({ ok: true, dbTime: result.rows[0].now });
  } catch (error) {
    next(error);
  }
});

app.get("/inventory", async (_req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, sku, name, price, stock, category, image FROM inventory ORDER BY id DESC",
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.post("/inventory", async (req, res, next) => {
  try {
    const payload = parsePayload(req.body);
    const result = await pool.query(
      `INSERT INTO inventory (sku, name, price, stock, category, image)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, sku, name, price, stock, category, image`,
      [payload.sku ?? null, payload.name, payload.price, payload.stock, payload.category, payload.image ?? null],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.put("/inventory/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).send("Invalid inventory id.");
      return;
    }

    const payload = parsePayload(req.body);
    const result = await pool.query(
      `UPDATE inventory
       SET sku = $1, name = $2, price = $3, stock = $4, category = $5, image = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, sku, name, price, stock, category, image`,
      [payload.sku ?? null, payload.name, payload.price, payload.stock, payload.category, payload.image ?? null, id],
    );

    if (!result.rowCount) {
      res.status(404).send("Inventory item not found.");
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete("/inventory/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).send("Invalid inventory id.");
      return;
    }

    const result = await pool.query("DELETE FROM inventory WHERE id = $1", [id]);
    if (!result.rowCount) {
      res.status(404).send("Inventory item not found.");
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.post("/cashier/checkout", async (req, res, next) => {
  const client = await pool.connect();

  try {
    const checkoutItems = parseCheckoutItems(req.body);
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
    const paid = total;
    const change = 0;
    const invoiceNo = createInvoiceNo(new Date());

    const saleResult = await client.query<{
      id: number;
      invoice_no: string;
      total: string;
      paid: string;
      change: string;
      created_at: string;
    }>(
      `INSERT INTO sales (invoice_no, total, paid, change)
       VALUES ($1, $2, $3, $4)
       RETURNING id, invoice_no, total, paid, change, created_at`,
      [invoiceNo, total, paid, change],
    );

    const sale = saleResult.rows[0];

    for (const item of saleItems) {
      await client.query(
        `INSERT INTO sale_items (sale_id, inventory_id, name, price, qty, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [sale.id, item.id, item.name, item.price, item.qty, item.subtotal],
      );

      await client.query("UPDATE inventory SET stock = stock - $1, updated_at = NOW() WHERE id = $2", [
        item.qty,
        item.id,
      ]);
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
});

app.get("/dashboard/summary", async (_req, res, next) => {
  try {
    const [statsResult, lowStockResult, recentTransactionsResult, topProductsResult, weeklySalesResult] = await Promise.all([
      pool.query<{
        omzet_today: string;
        transaksi_today: string;
        products_sold_today: string;
        low_stock_count: string;
      }>(`
        SELECT
          COALESCE(SUM(total) FILTER (WHERE created_at::date = CURRENT_DATE), 0)::text AS omzet_today,
          COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::text AS transaksi_today,
          COALESCE((
            SELECT SUM(si.qty)
            FROM sale_items si
            JOIN sales s ON s.id = si.sale_id
            WHERE s.created_at::date = CURRENT_DATE
          ), 0)::text AS products_sold_today,
          (SELECT COUNT(*) FROM inventory WHERE stock <= 10)::text AS low_stock_count
        FROM sales
      `),
      pool.query<{
        id: number;
        name: string;
        stock: number;
      }>(
        `SELECT id, name, stock
         FROM inventory
         WHERE stock <= 10
         ORDER BY stock ASC, name ASC
         LIMIT 5`,
      ),
      pool.query<{
        id: number;
        invoice_no: string;
        total: string;
        created_at: string;
      }>(
        `SELECT id, invoice_no, total, created_at
         FROM sales
         ORDER BY created_at DESC
         LIMIT 5`,
      ),
      pool.query<{
        inventory_id: number;
        name: string;
        sold: string;
        revenue: string;
      }>(
        `SELECT
          si.inventory_id,
          si.name,
          SUM(si.qty)::text AS sold,
          SUM(si.subtotal)::text AS revenue
         FROM sale_items si
         GROUP BY si.inventory_id, si.name
         ORDER BY SUM(si.qty) DESC, si.name ASC
         LIMIT 5`,
      ),
      pool.query<{
        day: string;
        revenue: string;
      }>(
        `SELECT
          TO_CHAR(days.day, 'Dy') AS day,
          COALESCE(SUM(s.total), 0)::text AS revenue
         FROM generate_series(CURRENT_DATE - INTERVAL '6 day', CURRENT_DATE, INTERVAL '1 day') AS days(day)
         LEFT JOIN sales s ON s.created_at::date = days.day::date
         GROUP BY days.day
         ORDER BY days.day`,
      ),
    ]);

    const stats = statsResult.rows[0] ?? {
      omzet_today: "0",
      transaksi_today: "0",
      products_sold_today: "0",
      low_stock_count: "0",
    };

    res.json({
      stats: {
        omzetToday: Number(stats.omzet_today),
        transaksiToday: Number(stats.transaksi_today),
        productsSoldToday: Number(stats.products_sold_today),
        lowStockCount: Number(stats.low_stock_count),
      },
      lowStockItems: lowStockResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        stock: Number(row.stock),
      })),
      recentTransactions: recentTransactionsResult.rows.map((row) => ({
        id: row.id,
        invoiceNo: row.invoice_no,
        total: Number(row.total),
        createdAt: row.created_at,
      })),
      topProducts: topProductsResult.rows.map((row) => ({
        id: row.inventory_id,
        name: row.name,
        sold: Number(row.sold),
        revenue: Number(row.revenue),
      })),
      weeklySales: weeklySalesResult.rows.map((row) => ({
        day: row.day,
        revenue: Number(row.revenue),
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  if (error instanceof Error) {
    res.status(400).send(error.message);
    return;
  }
  res.status(500).send("Unexpected server error.");
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
