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

export async function getPurchases(): Promise<Purchase[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/purchases`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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
