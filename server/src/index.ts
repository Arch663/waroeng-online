import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { initializeDatabase, pool } from "./db";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);
const corsOrigin =
  process.env.CORS_ORIGIN?.split(",").map((value) => value.trim()) ?? true;

const JWT_SECRET = process.env.JWT_SECRET || "waroeng_super_secret_key_2026";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
    full_name: string;
  };
}

const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).send("Authentication required.");
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send("Invalid or expired token.");
  }
};

const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res
        .status(403)
        .send("You don't have permission to access this resource.");
      return;
    }
    next();
  };
};

app.post("/auth/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new Error("Username and password are required.");
    }

    const result = await pool.query(
      "SELECT id, username, password_hash, full_name, role FROM users WHERE username = $1 AND is_active = true",
      [username],
    );

    if (result.rowCount === 0) {
      res.status(401).send("Invalid username or password.");
      return;
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      res.status(401).send("Invalid username or password.");
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/auth/me", authenticate, (req: AuthRequest, res) => {
  res.json(req.user);
});

interface InventoryPayload {
  name: string;
  price: number;
  stock: number;
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
  const category = body.category ? String(body.category).trim() : undefined;
  const category_id = body.category_id ? Number(body.category_id) : undefined;
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
  if (!category && !category_id) {
    throw new Error("Kategori tidak boleh kosong");
  }

  return { name, price, stock, category, category_id, sku, image };
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
  return `TRX-${yyyy}${mm}${dd}-${hh}${mi}${ss}-${Math.floor(
    Math.random() * 1000,
  )
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

app.get("/categories", authenticate, async (_req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description FROM categories ORDER BY name ASC",
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.get("/inventory", authenticate, async (req, res, next) => {
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
});

app.post(
  "/inventory",
  authenticate,
  authorize(["admin"]),
  async (req: AuthRequest, res, next) => {
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
  },
);

app.put(
  "/inventory/:id",
  authenticate,
  authorize(["admin"]),
  async (req: AuthRequest, res, next) => {
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
  },
);

app.get(
  "/inventory/:id/movements",
  authenticate,
  authorize(["admin", "manager"]),
  async (req, res, next) => {
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
  },
);

app.delete(
  "/inventory/:id",
  authenticate,
  authorize(["admin"]),
  async (req, res, next) => {
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
  },
);

app.post(
  "/cashier/checkout",
  authenticate,
  authorize(["admin", "cashier"]),
  async (req: AuthRequest, res, next) => {
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

      const normalizedItems = Array.from(itemMap.entries()).map(
        ([id, qty]) => ({
          id,
          qty,
        }),
      );

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
  },
);

app.get(
  "/dashboard/summary",
  authenticate,
  authorize(["admin", "manager"]),
  async (_req, res, next) => {
    try {
      const [
        statsResult,
        lowStockResult,
        recentTransactionsResult,
        topProductsResult,
        weeklySalesResult,
        monthlySalesResult,
        dailyMonthSalesResult,
        categorySalesResult,
        weeklyPurchasesResult,
        monthlyPurchasesResult,
      ] = await Promise.all([
        pool.query<{
          omzet_today: string;
          transaksi_today: string;
          products_sold_today: string;
          low_stock_count: string;
          omzet_month: string;
          transaksi_month: string;
          purchases_today: string;
          purchases_month: string;
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
          (SELECT COUNT(*) FROM inventory WHERE stock <= 10)::text AS low_stock_count,
          COALESCE(SUM(total) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)), 0)::text AS omzet_month,
          COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE))::text AS transaksi_month,
          (SELECT COALESCE(SUM(total_cost), 0) FROM purchases WHERE purchase_date::date = CURRENT_DATE)::text AS purchases_today,
          (SELECT COALESCE(SUM(total_cost), 0) FROM purchases WHERE DATE_TRUNC('month', purchase_date) = DATE_TRUNC('month', CURRENT_DATE))::text AS purchases_month
        FROM sales
      `),
        pool.query<{ id: number; name: string; stock: number }>(
          `SELECT id, name, stock FROM inventory WHERE stock <= 10 ORDER BY stock ASC, name ASC LIMIT 5`,
        ),
        pool.query<{
          id: number;
          invoice_no: string;
          total: string;
          created_at: string;
        }>(
          `SELECT id, invoice_no, total, created_at FROM sales ORDER BY created_at DESC LIMIT 5`,
        ),
        pool.query<{
          inventory_id: number;
          name: string;
          sold: string;
          revenue: string;
        }>(
          `SELECT si.inventory_id, si.name, SUM(si.qty)::text AS sold, SUM(si.subtotal)::text AS revenue FROM sale_items si GROUP BY si.inventory_id, si.name ORDER BY SUM(si.qty) DESC, si.name ASC LIMIT 5`,
        ),
        pool.query<{ day: string; revenue: string }>(
          `SELECT TO_CHAR(days.day, 'Dy') AS day, COALESCE(SUM(s.total), 0)::text AS revenue FROM generate_series(CURRENT_DATE - INTERVAL '6 day', CURRENT_DATE, INTERVAL '1 day') AS days(day) LEFT JOIN sales s ON s.created_at::date = days.day::date GROUP BY days.day ORDER BY days.day`,
        ),
        pool.query<{ month: string; revenue: string }>(
          `SELECT TO_CHAR(months.month, 'Mon') AS month, COALESCE(SUM(s.total), 0)::text AS revenue FROM generate_series(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 month'), DATE_TRUNC('month', CURRENT_DATE), INTERVAL '1 month') AS months(month) LEFT JOIN sales s ON DATE_TRUNC('month', s.created_at) = months.month GROUP BY months.month ORDER BY months.month`,
        ),
        pool.query<{ day: string; revenue: string }>(
          `SELECT TO_CHAR(days.day, 'DD') AS day, COALESCE(SUM(s.total), 0)::text AS revenue FROM generate_series(DATE_TRUNC('month', CURRENT_DATE), CURRENT_DATE, INTERVAL '1 day') AS days(day) LEFT JOIN sales s ON s.created_at::date = days.day::date GROUP BY days.day ORDER BY days.day`,
        ),
        pool.query<{ category: string; revenue: string }>(
          `SELECT COALESCE(c.name, 'Lainnya') as category, SUM(si.subtotal)::text as revenue
           FROM sale_items si
           LEFT JOIN inventory i ON si.inventory_id = i.id
           LEFT JOIN categories c ON i.category_id = c.id
           GROUP BY c.name
           ORDER BY revenue DESC`,
        ),
        pool.query<{ day: string; amount: string }>(
          `SELECT TO_CHAR(days.day, 'Dy') AS day, COALESCE(SUM(p.total_cost), 0)::text AS amount FROM generate_series(CURRENT_DATE - INTERVAL '6 day', CURRENT_DATE, INTERVAL '1 day') AS days(day) LEFT JOIN purchases p ON p.purchase_date::date = days.day::date GROUP BY days.day ORDER BY days.day`,
        ),
        pool.query<{ month: string; amount: string }>(
          `SELECT TO_CHAR(months.month, 'Mon') AS month, COALESCE(SUM(p.total_cost), 0)::text AS amount FROM generate_series(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 month'), DATE_TRUNC('month', CURRENT_DATE), INTERVAL '1 month') AS months(month) LEFT JOIN purchases p ON DATE_TRUNC('month', p.purchase_date) = months.month GROUP BY months.month ORDER BY months.month`,
        ),
      ]);

      const stats = statsResult.rows[0] ?? {
        omzet_today: "0",
        transaksi_today: "0",
        products_sold_today: "0",
        low_stock_count: "0",
        omzet_month: "0",
        transaksi_month: "0",
      };

      res.json({
        stats: {
          omzetToday: Number(stats.omzet_today),
          transaksiToday: Number(stats.transaksi_today),
          productsSoldToday: Number(stats.products_sold_today),
          lowStockCount: Number(stats.low_stock_count),
          omzetMonth: Number(stats.omzet_month),
          transaksiMonth: Number(stats.transaksi_month),
        },
        lowStockItems: lowStockResult.rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          stock: Number(row.stock),
        })),
        recentTransactions: recentTransactionsResult.rows.map((row: any) => ({
          id: row.id,
          invoiceNo: row.invoice_no,
          total: Number(row.total),
          createdAt: row.created_at,
        })),
        topProducts: topProductsResult.rows.map((row: any) => ({
          id: row.inventory_id,
          name: row.name,
          sold: Number(row.sold),
          revenue: Number(row.revenue),
        })),
        weeklySales: weeklySalesResult.rows.map((row: any) => ({
          day: row.day,
          revenue: Number(row.revenue),
        })),
        monthlySales: monthlySalesResult.rows.map((row: any) => ({
          month: row.month,
          revenue: Number(row.revenue),
        })),
        dailyMonthSales: dailyMonthSalesResult.rows.map((row: any) => ({
          day: row.day,
          revenue: Number(row.revenue),
        })),
        categorySales: categorySalesResult.rows.map((row: any) => ({
          category: row.category,
          revenue: Number(row.revenue),
        })),
        purchaseStats: {
          purchasesToday: Number(stats.purchases_today),
          purchasesMonth: Number(stats.purchases_month),
        },
        weeklyPurchases: weeklyPurchasesResult.rows.map((row: any) => ({
          day: row.day,
          amount: Number(row.amount),
        })),
        monthlyPurchases: monthlyPurchasesResult.rows.map((row: any) => ({
          month: row.month,
          amount: Number(row.amount),
        })),
      });
    } catch (error) {
      next(error);
    }
  },
);

app.get(
  "/reports/summary",
  authenticate,
  authorize(["admin", "manager"]),
  async (req, res, next) => {
    try {
      let interval = "1 month";
      if (period === "day") interval = "1 day";
      if (period === "week") interval = "1 week";
      if (period === "year") interval = "1 year";

      const [
        salesStatsResult,
        categoryStats,
        topPerformers,
        expenseStatsResult,
      ] = await Promise.all([
        pool.query(`
        SELECT 
          COUNT(*)::integer as total_sales,
          COALESCE(SUM(total), 0)::numeric as gross_revenue
        FROM sales
        WHERE created_at >= CURRENT_DATE - INTERVAL '${interval}'
      `),
        pool.query(`
        SELECT c.name, SUM(si.qty)::integer as units_sold, SUM(si.subtotal)::numeric as revenue
        FROM sale_items si
        JOIN inventory i ON si.inventory_id = i.id
        LEFT JOIN categories c ON i.category_id = c.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.created_at >= CURRENT_DATE - INTERVAL '${interval}'
        GROUP BY c.name
        ORDER BY revenue DESC
      `),
        pool.query(`
        SELECT name, SUM(qty)::integer as total_qty, SUM(subtotal)::numeric as total_revenue
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE s.created_at >= CURRENT_DATE - INTERVAL '${interval}'
        GROUP BY name
        ORDER BY total_qty DESC
        LIMIT 10
      `),
        pool.query(`
        SELECT COALESCE(SUM(total_cost), 0)::numeric as total_expenses
        FROM purchases
        WHERE purchase_date >= CURRENT_DATE - INTERVAL '${interval}'
      `),
      ]);

      const salesStats = salesStatsResult.rows[0];
      const expenseStats = expenseStatsResult.rows[0];
      const grossRevenue = Number(salesStats.gross_revenue || 0);
      const totalExpenses = Number(expenseStats.total_expenses || 0);
      const profit = grossRevenue - totalExpenses;

      res.json({
        sales: {
          total_sales: salesStats.total_sales,
          gross_revenue: grossRevenue,
          total_expenses: totalExpenses,
          profit: profit,
        },
        categories: categoryStats.rows,
        topProducts: topPerformers.rows,
      });
    } catch (error) {
      next(error);
    }
  },
);

app.get(
  "/suppliers",
  authenticate,
  authorize(["admin", "manager"]),
  async (req, res, next) => {
    try {
      const { sortBy = "name", order = "ASC" } = req.query;
      const allowedCols = ["name", "contact_person", "phone", "address"];
      const col = allowedCols.includes(String(sortBy))
        ? String(sortBy)
        : "name";
      const ord = String(order).toUpperCase() === "DESC" ? "DESC" : "ASC";

      const result = await pool.query(
        `SELECT * FROM suppliers ORDER BY ${col} ${ord}`,
      );
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  },
);

app.post(
  "/suppliers",
  authenticate,
  authorize(["admin"]),
  async (req: AuthRequest, res, next) => {
    try {
      const { name, contact_person, phone, address } = req.body;
      const result = await pool.query(
        `INSERT INTO suppliers (name, contact_person, phone, address) VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, contact_person, phone, address],
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  },
);

app.put(
  "/suppliers/:id",
  authenticate,
  authorize(["admin"]),
  async (req: AuthRequest, res, next) => {
    try {
      const id = Number(req.params.id);
      const { name, contact_person, phone, address } = req.body;
      const result = await pool.query(
        `UPDATE suppliers SET name = $1, contact_person = $2, phone = $3, address = $4, updated_at = NOW() WHERE id = $5 RETURNING *`,
        [name, contact_person, phone, address, id],
      );
      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  },
);

app.delete(
  "/suppliers/:id",
  authenticate,
  authorize(["admin"]),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await pool.query("DELETE FROM suppliers WHERE id = $1", [id]);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

app.get(
  "/purchases",
  authenticate,
  authorize(["admin", "manager"]),
  async (_req, res, next) => {
    try {
      const result = await pool.query(`
      SELECT p.*, s.name as supplier_name, i.name as product_name, u.full_name as created_by_name
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN inventory i ON p.inventory_id = i.id
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.purchase_date DESC
    `);
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  },
);

app.post(
  "/purchases",
  authenticate,
  authorize(["admin"]),
  async (req: AuthRequest, res, next) => {
    const client = await pool.connect();
    try {
      const { supplier_id, inventory_id, quantity, cost_price, notes } =
        req.body;
      await client.query("BEGIN");

      const invRes = await client.query(
        "SELECT stock FROM inventory WHERE id = $1 FOR UPDATE",
        [inventory_id],
      );
      if (invRes.rowCount === 0) throw new Error("Inventory item not found.");
      const oldStock = Number(invRes.rows[0].stock);

      const result = await client.query(
        `INSERT INTO purchases (supplier_id, inventory_id, quantity, cost_price, total_cost, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          supplier_id,
          inventory_id,
          quantity,
          cost_price,
          quantity * cost_price,
          notes,
          req.user?.id,
        ],
      );

      const purchase = result.rows[0];

      await client.query(
        "UPDATE inventory SET stock = stock + $1, updated_at = NOW() WHERE id = $2",
        [quantity, inventory_id],
      );

      await client.query(
        `INSERT INTO stock_movements (inventory_id, movement_type, quantity, stock_before, stock_after, reference_id, reference_type, notes, created_by)
       VALUES ($1, 'purchase', $2, $3, $4, $5, 'purchase', $6, $7)`,
        [
          inventory_id,
          quantity,
          oldStock,
          oldStock + quantity,
          purchase.id,
          notes || "Pembelian barang",
          req.user?.id,
        ],
      );

      await client.query("COMMIT");
      res.status(201).json(purchase);
    } catch (error) {
      await client.query("ROLLBACK");
      next(error);
    } finally {
      client.release();
    }
  },
);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);
    if (error instanceof Error) {
      res.status(400).send(error.message);
      return;
    }
    res.status(500).send("Unexpected server error.");
  },
);

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
