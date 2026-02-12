import { DATABASE_API_URL } from "@/config/api";

export interface InventoryItem {
  id: number;
  sku?: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

export interface InventoryPayload {
  name: string;
  price: number;
  stock: number;
  category: string;
  sku?: string;
  image?: string;
}

const baseUrl = DATABASE_API_URL?.replace(/\/$/, "");

function assertApiUrl() {
  if (!baseUrl) {
    throw new Error("VITE_DATABASE_API_URL is not set in .env");
  }
}

function normalizeItem(raw: any): InventoryItem {
  return {
    id: Number(raw.id),
    sku: raw.sku,
    name: String(raw.name ?? ""),
    price: Number(raw.price ?? 0),
    stock: Number(raw.stock ?? 0),
    category: String(raw.category ?? "Lainnya"),
    image: raw.image,
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  assertApiUrl();
  const res = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const data = await request<any[]>("/inventory");
  return data.map(normalizeItem);
}

export async function createInventoryItem(
  payload: InventoryPayload,
): Promise<InventoryItem> {
  const data = await request<any>("/inventory", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeItem(data);
}

export async function updateInventoryItem(
  id: number,
  payload: InventoryPayload,
): Promise<InventoryItem> {
  const data = await request<any>(`/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return normalizeItem(data);
}

export async function deleteInventoryItem(id: number): Promise<void> {
  await request<void>(`/inventory/${id}`, {
    method: "DELETE",
  });
}
