import bcrypt from "bcryptjs";
import type { Pool, PoolClient } from "pg";

type SeedProduct = {
  sku: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string | null;
};

const categorySeeds = [
  { name: "Makanan", description: "Produk makanan dan camilan" },
  { name: "Minuman", description: "Minuman ringan dan berat" },
  { name: "Sembako", description: "Kebutuhan pokok sehari-hari" },
  { name: "Alat Tulis", description: "Peralatan tulis dan kantor" },
  { name: "Kesehatan", description: "Produk kesehatan dan obat-obatan" },
  { name: "Lainnya", description: "Kategori lainnya" },
];

const supplierSeeds = [
  { name: "PT Sumber Pangan Nusantara", contact: "Ardi Saputra", phone: "08120000111", address: "Jakarta Selatan" },
  { name: "CV Segar Abadi", contact: "Nanda Wijaya", phone: "08120000112", address: "Bandung" },
  { name: "UD Berkah Sembako", contact: "Rudi Hartono", phone: "08120000113", address: "Semarang" },
  { name: "PT Tirta Minuman Prima", contact: "Maya Lestari", phone: "08120000114", address: "Surabaya" },
  { name: "CV Kantor Maju", contact: "Asep Gunawan", phone: "08120000115", address: "Yogyakarta" },
  { name: "PT Medika Harapan", contact: "Sinta Rahma", phone: "08120000116", address: "Bekasi" },
];

const productSeeds: SeedProduct[] = [
  { sku: "SKU-0001", name: "Beras Premium 5kg", price: 76000, stock: 28, category: "Sembako", image: null },
  { sku: "SKU-0002", name: "Minyak Goreng 1L", price: 18500, stock: 32, category: "Sembako", image: null },
  { sku: "SKU-0003", name: "Gula Pasir 1kg", price: 17200, stock: 35, category: "Sembako", image: null },
  { sku: "SKU-0004", name: "Tepung Terigu 1kg", price: 13200, stock: 30, category: "Sembako", image: null },
  { sku: "SKU-0005", name: "Mie Instan Goreng", price: 3600, stock: 90, category: "Makanan", image: null },
  { sku: "SKU-0006", name: "Sarden Kaleng 155g", price: 9800, stock: 48, category: "Makanan", image: null },
  { sku: "SKU-0007", name: "Biskuit Coklat 120g", price: 8200, stock: 55, category: "Makanan", image: null },
  { sku: "SKU-0008", name: "Roti Tawar Besar", price: 18500, stock: 26, category: "Makanan", image: null },
  { sku: "SKU-0009", name: "Kopi Bubuk 200g", price: 23800, stock: 33, category: "Minuman", image: null },
  { sku: "SKU-0010", name: "Teh Celup 50 Sachet", price: 15200, stock: 34, category: "Minuman", image: null },
  { sku: "SKU-0011", name: "Susu UHT 1L", price: 18700, stock: 37, category: "Minuman", image: null },
  { sku: "SKU-0012", name: "Air Mineral 600ml", price: 4200, stock: 120, category: "Minuman", image: null },
  { sku: "SKU-0013", name: "Sabun Mandi 90g", price: 5200, stock: 62, category: "Kesehatan", image: null },
  { sku: "SKU-0014", name: "Sampo Sachet", price: 1600, stock: 160, category: "Kesehatan", image: null },
  { sku: "SKU-0015", name: "Pasta Gigi 190g", price: 13200, stock: 40, category: "Kesehatan", image: null },
  { sku: "SKU-0016", name: "Sikat Gigi Soft", price: 7600, stock: 45, category: "Kesehatan", image: null },
  { sku: "SKU-0017", name: "Hand Sanitizer 100ml", price: 14200, stock: 30, category: "Kesehatan", image: null },
  { sku: "SKU-0018", name: "Masker Medis 10pcs", price: 12500, stock: 44, category: "Kesehatan", image: null },
  { sku: "SKU-0019", name: "Buku Tulis 38 Lembar", price: 4200, stock: 80, category: "Alat Tulis", image: null },
  { sku: "SKU-0020", name: "Pulpen Gel Hitam", price: 3500, stock: 90, category: "Alat Tulis", image: null },
  { sku: "SKU-0021", name: "Pensil HB", price: 2500, stock: 95, category: "Alat Tulis", image: null },
  { sku: "SKU-0022", name: "Penghapus Putih", price: 2200, stock: 70, category: "Alat Tulis", image: null },
  { sku: "SKU-0023", name: "Tisu Wajah 250 Sheet", price: 9800, stock: 58, category: "Lainnya", image: null },
  { sku: "SKU-0024", name: "Detergen Bubuk 800g", price: 18600, stock: 36, category: "Lainnya", image: null },
  { sku: "SKU-0025", name: "Pewangi Pakaian 900ml", price: 17400, stock: 34, category: "Lainnya", image: null },
];

async function ensureCategories(client: PoolClient) {
  for (const category of categorySeeds) {
    await client.query(
      `INSERT INTO categories (name, description)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description`,
      [category.name, category.description],
    );
  }
}

async function ensureUsers(client: PoolClient) {
  const users = [
    { username: "admin", password: "admin123", fullName: "Administrator", role: "admin" },
    { username: "kasir", password: "kasir123", fullName: "Kasir Utama", role: "cashier" },
    { username: "manager", password: "manager123", fullName: "Manager Operasional", role: "manager" },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await client.query(
      `INSERT INTO users (username, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (username) DO NOTHING`,
      [user.username, passwordHash, user.fullName, user.role],
    );
  }
}

async function ensureSuppliers(client: PoolClient) {
  for (const supplier of supplierSeeds) {
    await client.query(
      `INSERT INTO suppliers (name, contact_person, phone, address)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (name) DO NOTHING`,
      [supplier.name, supplier.contact, supplier.phone, supplier.address],
    );
  }
}

async function ensureInventory(client: PoolClient, createdBy: number | null) {
  const categoryRows = await client.query<{ id: number; name: string }>(
    "SELECT id, name FROM categories",
  );
  const categoryMap = new Map(categoryRows.rows.map((row) => [row.name, row.id]));

  for (const product of productSeeds) {
    const categoryId = categoryMap.get(product.category) ?? null;
    await client.query(
      `INSERT INTO inventory
       (sku, name, price, stock, category_id, category, image, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
       ON CONFLICT (sku) DO UPDATE
       SET name = EXCLUDED.name,
           price = EXCLUDED.price,
           category_id = EXCLUDED.category_id,
           category = EXCLUDED.category,
           image = EXCLUDED.image,
           updated_by = EXCLUDED.updated_by,
           updated_at = NOW()`,
      [
        product.sku,
        product.name,
        product.price,
        product.stock,
        categoryId,
        product.category,
        product.image,
        createdBy,
      ],
    );
  }

  const countRes = await client.query<{ count: string }>(
    "SELECT COUNT(*) FROM inventory",
  );
  const totalProducts = Number(countRes.rows[0].count);

  if (totalProducts < 25) {
    const needed = 25 - totalProducts;
    for (let i = 0; i < needed; i += 1) {
      const number = String(i + 1).padStart(2, "0");
      await client.query(
        `INSERT INTO inventory
         (sku, name, price, stock, category_id, category, created_by, updated_by)
         VALUES ($1, $2, $3, $4,
           (SELECT id FROM categories WHERE name = 'Lainnya' LIMIT 1),
           'Lainnya',
           $5,
           $5)
         ON CONFLICT (sku) DO NOTHING`,
        [
          `SKU-SEED-${number}`,
          `Produk Seeder ${number}`,
          10000 + i * 500,
          20 + i,
          createdBy,
        ],
      );
    }
  }
}

async function ensurePurchases(client: PoolClient, createdBy: number | null) {
  const purchaseCount = await client.query<{ count: string }>(
    "SELECT COUNT(*) FROM purchases",
  );
  if (Number(purchaseCount.rows[0].count) > 0) return;

  const suppliers = await client.query<{ id: number }>(
    "SELECT id FROM suppliers ORDER BY id ASC LIMIT 6",
  );
  const products = await client.query<{ id: number; stock: number; price: string }>(
    "SELECT id, stock, price::text FROM inventory ORDER BY id ASC LIMIT 12",
  );

  const seedRows = Math.min(suppliers.rows.length, products.rows.length, 8);
  for (let i = 0; i < seedRows; i += 1) {
    const supplierId = suppliers.rows[i % suppliers.rows.length].id;
    const product = products.rows[i];
    const quantity = 6 + i;
    const costPrice = Math.max(1000, Math.round(Number(product.price) * 0.65));
    const totalCost = costPrice * quantity;
    const before = product.stock;
    const after = before + quantity;

    const purchase = await client.query<{ id: number }>(
      `INSERT INTO purchases
       (supplier_id, inventory_id, quantity, cost_price, total_cost, notes, created_by, purchase_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - ($8::int * INTERVAL '1 day'))
       RETURNING id`,
      [
        supplierId,
        product.id,
        quantity,
        costPrice,
        totalCost,
        `Seeder purchase #${i + 1}`,
        createdBy,
        i + 2,
      ],
    );

    await client.query(
      "UPDATE inventory SET stock = $1, updated_at = NOW(), updated_by = $2 WHERE id = $3",
      [after, createdBy, product.id],
    );

    await client.query(
      `INSERT INTO stock_movements
       (inventory_id, movement_type, quantity, stock_before, stock_after, reference_id, reference_type, notes, created_by)
       VALUES ($1, 'purchase', $2, $3, $4, $5, 'purchase', $6, $7)`,
      [product.id, quantity, before, after, purchase.rows[0].id, "Seeder restock", createdBy],
    );
  }
}

async function ensureSales(client: PoolClient, cashierId: number | null) {
  const saleCount = await client.query<{ count: string }>("SELECT COUNT(*) FROM sales");
  if (Number(saleCount.rows[0].count) > 0) return;

  const inventoryRows = await client.query<{
    id: number;
    name: string;
    price: string;
    stock: number;
  }>(
    "SELECT id, name, price::text, stock FROM inventory WHERE stock > 4 ORDER BY id ASC LIMIT 20",
  );

  const stockMap = new Map(
    inventoryRows.rows.map((row) => [row.id, { ...row, price: Number(row.price) }]),
  );

  for (let i = 0; i < 6; i += 1) {
    const selected = inventoryRows.rows.slice(i * 3, i * 3 + 3);
    if (selected.length === 0) break;

    const items: Array<{ id: number; name: string; price: number; qty: number; subtotal: number }> = [];
    for (const baseItem of selected) {
      const current = stockMap.get(baseItem.id);
      if (!current) continue;
      const qty = Math.min(2 + (i % 2), Math.max(current.stock - 1, 0));
      if (qty <= 0) continue;
      items.push({
        id: current.id,
        name: current.name,
        price: current.price,
        qty,
        subtotal: current.price * qty,
      });
      current.stock -= qty;
      stockMap.set(current.id, current);
    }

    if (items.length === 0) continue;

    const total = items.reduce((acc, item) => acc + item.subtotal, 0);
    const paid = total + 20000;
    const change = paid - total;

    const sale = await client.query<{ id: number }>(
      `INSERT INTO sales (invoice_no, total, paid, change, cashier_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW() - ($6::int * INTERVAL '1 day'))
       RETURNING id`,
      [`INV-SEED-${String(i + 1).padStart(4, "0")}`, total, paid, change, cashierId, i + 1],
    );

    for (const item of items) {
      const current = stockMap.get(item.id);
      const stockAfter = current?.stock ?? 0;
      const stockBefore = stockAfter + item.qty;

      await client.query(
        `INSERT INTO sale_items (sale_id, inventory_id, name, price, qty, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [sale.rows[0].id, item.id, item.name, item.price, item.qty, item.subtotal],
      );

      await client.query(
        "UPDATE inventory SET stock = $1, updated_at = NOW(), updated_by = $2 WHERE id = $3",
        [stockAfter, cashierId, item.id],
      );

      await client.query(
        `INSERT INTO stock_movements
         (inventory_id, movement_type, quantity, stock_before, stock_after, reference_id, reference_type, notes, created_by)
         VALUES ($1, 'sale', $2, $3, $4, $5, 'sale', $6, $7)`,
        [item.id, -item.qty, stockBefore, stockAfter, sale.rows[0].id, "Seeder sale", cashierId],
      );
    }
  }
}

async function ensureStockMovementsFallback(client: PoolClient, createdBy: number | null) {
  const movementCount = await client.query<{ count: string }>(
    "SELECT COUNT(*) FROM stock_movements",
  );
  if (Number(movementCount.rows[0].count) > 0) return;

  const inventoryRows = await client.query<{ id: number; stock: number }>(
    "SELECT id, stock FROM inventory ORDER BY id ASC LIMIT 5",
  );

  for (const row of inventoryRows.rows) {
    await client.query(
      `INSERT INTO stock_movements
       (inventory_id, movement_type, quantity, stock_before, stock_after, reference_type, notes, created_by)
       VALUES ($1, 'adjustment', 0, $2, $2, 'seed', 'Seeder baseline', $3)`,
      [row.id, row.stock, createdBy],
    );
  }
}

export async function seedDatabase(pool: Pool) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await ensureCategories(client);
    await ensureUsers(client);
    await ensureSuppliers(client);

    const adminUser = await client.query<{ id: number }>(
      "SELECT id FROM users WHERE username = 'admin' LIMIT 1",
    );
    const cashierUser = await client.query<{ id: number }>(
      "SELECT id FROM users WHERE username = 'kasir' LIMIT 1",
    );

    const adminId = adminUser.rows[0]?.id ?? null;
    const cashierId = cashierUser.rows[0]?.id ?? adminId;

    await ensureInventory(client, adminId);
    await ensurePurchases(client, adminId);
    await ensureSales(client, cashierId);
    await ensureStockMovementsFallback(client, adminId);

    await client.query("COMMIT");
    console.log("Database seeder executed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
