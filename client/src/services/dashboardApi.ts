import { DATABASE_API_URL } from "@/config/api";

export interface DashboardStats {
  omzetToday: number;
  transaksiToday: number;
  productsSoldToday: number;
  lowStockCount: number;
}

export interface LowStockItem {
  id: number;
  name: string;
  stock: number;
}

export interface RecentTransaction {
  id: number;
  invoiceNo: string;
  total: number;
  createdAt: string;
}

export interface TopProduct {
  id: number;
  name: string;
  sold: number;
  revenue: number;
}

export interface WeeklySalesPoint {
  day: string;
  revenue: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  lowStockItems: LowStockItem[];
  recentTransactions: RecentTransaction[];
  topProducts: TopProduct[];
  weeklySales: WeeklySalesPoint[];
}

const baseUrl = DATABASE_API_URL?.replace(/\/$/, "");

function assertApiUrl() {
  if (!baseUrl) {
    throw new Error("VITE_DATABASE_API_URL is not set in .env");
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  assertApiUrl();
  const res = await fetch(`${baseUrl}/dashboard/summary`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return (await res.json()) as DashboardSummary;
}
