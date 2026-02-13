import { DATABASE_API_URL } from "@/config/api";

interface CheckoutItemPayload {
  id: number;
  qty: number;
}

export interface CheckoutPayload {
  items: CheckoutItemPayload[];
}

export interface CheckoutResult {
  id: number;
  invoiceNo: string;
  total: number;
  paid: number;
  change: number;
  createdAt: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    stock: number;
    qty: number;
    subtotal: number;
  }>;
}

const baseUrl = DATABASE_API_URL?.replace(/\/$/, "");

function assertApiUrl() {
  if (!baseUrl) {
    throw new Error("VITE_DATABASE_API_URL is not set in .env");
  }
}

export async function checkout(payload: CheckoutPayload): Promise<CheckoutResult> {
  assertApiUrl();
  const res = await fetch(`${baseUrl}/cashier/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return (await res.json()) as CheckoutResult;
}
