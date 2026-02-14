import { DATABASE_API_URL } from "@/config/api";

export interface InventoryItem {
  id: number;
  sku?: string;
  name: string;
  price: number;
  stock: number;
  category_id?: number;
  category: string;
  image?: string;
}

export interface InventoryPayload {
  name: string;
  price: number;
  stock: number;
  category?: string; // legacy support
  category_id?: number; // new category relation
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
    category_id: raw.category_id ? Number(raw.category_id) : undefined,
    category: String(raw.category ?? "Lainnya"),
    image: raw.image,
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  assertApiUrl();
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as any) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
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

export interface InventoryResponse {
  items: InventoryItem[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export async function getInventoryItems(params?: {
  q?: string;
  page?: number;
  limit?: number;
  category_id?: number;
  sortBy?: string;
  order?: "ASC" | "DESC";
}): Promise<InventoryResponse> {
  const query = new URLSearchParams();
  if (params?.q) query.append("q", params.q);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.category_id)
    query.append("category_id", params.category_id.toString());
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.order) query.append("order", params.order);

  const queryString = query.toString();
  const path = `/inventory${queryString ? "?" + queryString : ""}`;
  const data = await request<any>(path);

  return {
    items: (data.items || []).map(normalizeItem),
    meta: data.meta || {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 10,
    },
  };
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
