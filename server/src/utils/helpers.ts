
export interface InventoryItemPayload {
    name: string;
    price: number;
    stock: number;
    sku?: string;
    image?: string;
    category?: string;
    category_id?: number;
}

export interface CheckoutItemPayload {
    id: number;
    qty: number;
}

export function parsePayload(raw: unknown): InventoryItemPayload {
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

export function parseCheckoutItems(raw: unknown): CheckoutItemPayload[] {
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

export function createInvoiceNo(now: Date) {
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
