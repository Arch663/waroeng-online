import { API_BASE_URL } from "@/config/api";

export interface Purchase {
  id: number;
  supplier_id: number;
  inventory_id: number;
  quantity: number;
  cost_price: number;
  total_cost: number;
  notes?: string;
  purchase_date: string;
  supplier_name?: string;
  product_name?: string;
  created_by_name?: string;
}

export interface PurchasePayload {
  supplier_id: number;
  inventory_id: number;
  quantity: number;
  cost_price: number;
  notes?: string;
}

export async function getPurchases(params?: {
  sortBy?: string;
  order?: "ASC" | "DESC";
}): Promise<Purchase[]> {
  const token = localStorage.getItem("token");
  const query = new URLSearchParams();
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.order) query.append("order", params.order);
  const res = await fetch(
    `${API_BASE_URL}/purchases${query.toString() ? "?" + query.toString() : ""}`,
    {
    headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) throw new Error("Gagal memuat data pembelian.");
  return res.json();
}

export async function createPurchase(
  payload: PurchasePayload,
): Promise<Purchase> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/purchases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal menyimpan pembelian.");
  return res.json();
}
