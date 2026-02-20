import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { db } from "../db";

const dayFmt = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short" });

function dateOnly(input: Date) {
    return new Date(input.getFullYear(), input.getMonth(), input.getDate());
}

function sameDate(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export const getDashboardSummary = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const now = new Date();
        const today = dateOnly(now);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [sales, saleItems, inventory, purchases] = await Promise.all([
            db.collection("sales").find({}).toArray(),
            db.collection("sale_items").find({}).toArray(),
            db.collection("inventory").find({}, { projection: { _id: 0, id: 1, name: 1, stock: 1, category: 1 } }).toArray(),
            db.collection("purchases").find({}).toArray(),
        ]);

        const salesToday = sales.filter((s: any) => sameDate(new Date(s.created_at), today));
        const salesMonth = sales.filter((s: any) => new Date(s.created_at) >= monthStart);
        const salesIdToday = new Set(salesToday.map((s: any) => s.id));
        const itemsToday = saleItems.filter((i: any) => salesIdToday.has(i.sale_id));

        const omzetToday = salesToday.reduce((sum: number, s: any) => sum + Number(s.total || 0), 0);
        const omzetMonth = salesMonth.reduce((sum: number, s: any) => sum + Number(s.total || 0), 0);
        const productsSoldToday = itemsToday.reduce((sum: number, i: any) => sum + Number(i.qty || 0), 0);
        const purchasesToday = purchases
            .filter((p: any) => sameDate(new Date(p.purchase_date), today))
            .reduce((sum: number, p: any) => sum + Number(p.total_cost || 0), 0);
        const purchasesMonth = purchases
            .filter((p: any) => new Date(p.purchase_date) >= monthStart)
            .reduce((sum: number, p: any) => sum + Number(p.total_cost || 0), 0);

        const lowStockItems = inventory
            .filter((item: any) => Number(item.stock) <= 10)
            .sort((a: any, b: any) => Number(a.stock) - Number(b.stock) || String(a.name).localeCompare(String(b.name)))
            .slice(0, 5)
            .map((row: any) => ({ id: row.id, name: row.name, stock: Number(row.stock) }));

        const recentTransactions = [...sales]
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map((row: any) => ({
                id: row.id,
                invoiceNo: row.invoice_no,
                total: Number(row.total),
                createdAt: row.created_at,
            }));

        const topMap = new Map<number, { id: number; name: string; sold: number; revenue: number }>();
        for (const item of saleItems) {
            const id = Number(item.inventory_id);
            const row = topMap.get(id) ?? { id, name: String(item.name), sold: 0, revenue: 0 };
            row.sold += Number(item.qty || 0);
            row.revenue += Number(item.subtotal || 0);
            topMap.set(id, row);
        }
        const topProducts = Array.from(topMap.values())
            .sort((a, b) => b.sold - a.sold || a.name.localeCompare(b.name))
            .slice(0, 5);

        const weeklySales = [];
        const weeklyPurchases = [];
        const weeklyProfit = [];
        for (let i = 6; i >= 0; i -= 1) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dailyRevenue = sales
                .filter((s: any) => sameDate(new Date(s.created_at), d))
                .reduce((sum: number, s: any) => sum + Number(s.total || 0), 0);
            const dailyPurchase = purchases
                .filter((p: any) => sameDate(new Date(p.purchase_date), d))
                .reduce((sum: number, p: any) => sum + Number(p.total_cost || 0), 0);
            const day = dayFmt.format(d);
            weeklySales.push({ day, revenue: dailyRevenue });
            weeklyPurchases.push({ day, amount: dailyPurchase });
            weeklyProfit.push({ day, profit: dailyRevenue - dailyPurchase });
        }

        const monthlySales = [];
        const monthlyPurchases = [];
        const monthlyProfit = [];
        for (let i = 5; i >= 0; i -= 1) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const monthlyRevenue = sales
                .filter((s: any) => new Date(s.created_at) >= monthDate && new Date(s.created_at) < nextMonth)
                .reduce((sum: number, s: any) => sum + Number(s.total || 0), 0);
            const monthlyPurchase = purchases
                .filter((p: any) => new Date(p.purchase_date) >= monthDate && new Date(p.purchase_date) < nextMonth)
                .reduce((sum: number, p: any) => sum + Number(p.total_cost || 0), 0);
            const month = monthFmt.format(monthDate);
            monthlySales.push({ month, revenue: monthlyRevenue });
            monthlyPurchases.push({ month, amount: monthlyPurchase });
            monthlyProfit.push({ month, profit: monthlyRevenue - monthlyPurchase });
        }

        const dailyMonthSales = [];
        for (let d = 1; d <= today.getDate(); d += 1) {
            const date = new Date(today.getFullYear(), today.getMonth(), d);
            const daySales = sales.filter((s: any) => sameDate(new Date(s.created_at), date));
            dailyMonthSales.push({
                day: String(d).padStart(2, "0"),
                revenue: daySales.reduce((sum: number, s: any) => sum + Number(s.total || 0), 0),
                count: daySales.length,
            });
        }

        const categoryByInventory = new Map(inventory.map((i: any) => [i.id, i.category ?? "Lainnya"]));
        const categoryRevenue = new Map<string, number>();
        for (const item of saleItems) {
            const category = String(categoryByInventory.get(item.inventory_id) ?? "Lainnya");
            categoryRevenue.set(category, (categoryRevenue.get(category) ?? 0) + Number(item.subtotal || 0));
        }
        const categorySales = Array.from(categoryRevenue.entries())
            .map(([category, revenue]) => ({ category, revenue }))
            .sort((a, b) => b.revenue - a.revenue);

        res.json({
            stats: {
                omzetToday,
                transaksiToday: salesToday.length,
                productsSoldToday,
                lowStockCount: inventory.filter((item: any) => Number(item.stock) <= 10).length,
                omzetMonth,
                transaksiMonth: salesMonth.length,
                profitToday: omzetToday - purchasesToday,
                profitMonth: omzetMonth - purchasesMonth,
            },
            lowStockItems,
            recentTransactions,
            topProducts,
            weeklySales,
            monthlySales,
            dailyMonthSales,
            categorySales,
            purchaseStats: {
                purchasesToday,
                purchasesMonth,
            },
            weeklyPurchases,
            monthlyPurchases,
            weeklyProfit,
            monthlyProfit,
        });
    } catch (error) {
        next(error);
    }
};
