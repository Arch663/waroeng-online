import { DATABASE_API_URL } from "@/config/api";

export interface DashboardStats {
  omzetToday: number;
  transaksiToday: number;
  productsSoldToday: number;
  lowStockCount: number;
  omzetMonth: number;
  transaksiMonth: number;
  purchasesToday?: number;
  purchasesMonth?: number;
  profitToday?: number;
  profitMonth?: number;
}

export interface ProfitPoint {
  day?: string;
  month?: string;
  profit: number;
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

export interface SalesPoint {
  day?: string;
  month?: string;
  revenue: number;
  count?: number;
}

export interface PurchasePoint {
  day?: string;
  month?: string;
  amount: number;
}

export interface CategoryPoint {
  category: string;
  revenue: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  lowStockItems: LowStockItem[];
  recentTransactions: RecentTransaction[];
  topProducts: TopProduct[];
  weeklySales: SalesPoint[];
  monthlySales: SalesPoint[];
  dailyMonthSales: SalesPoint[];
  categorySales: CategoryPoint[];
  purchaseStats?: {
    purchasesToday: number;
    purchasesMonth: number;
  };
  weeklyPurchases?: PurchasePoint[];
  monthlyPurchases?: PurchasePoint[];
  weeklyProfit: ProfitPoint[];
  monthlyProfit: ProfitPoint[];
}

export interface ReportSummary {
  sales: {
    total_sales: number;
    gross_revenue: number;
    total_expenses: number;
    profit: number;
  };
  categories: Array<{
    name: string;
    units_sold: number;
    revenue: number;
  }>;
  topProducts: Array<{
    name: string;
    total_qty: number;
    total_revenue: number;
  }>;
}

const baseUrl = DATABASE_API_URL?.replace(/\/$/, "");

function assertApiUrl() {
  if (!baseUrl) {
    throw new Error("VITE_DATABASE_API_URL is not set in .env");
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  assertApiUrl();
  const token = localStorage.getItem("token");
  const res = await fetch(`${baseUrl}/dashboard/summary`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return (await res.json()) as DashboardSummary;
}

export async function getReportsSummary(
  period = "month",
): Promise<ReportSummary> {
  assertApiUrl();
  const token = localStorage.getItem("token");
  const res = await fetch(`${baseUrl}/reports/summary?period=${period}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return (await res.json()) as ReportSummary;
}
