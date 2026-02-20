import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { db } from "../db";

function getFromDate(period: unknown) {
    const now = new Date();
    const from = new Date(now);
    if (period === "day") from.setDate(from.getDate() - 1);
    else if (period === "week") from.setDate(from.getDate() - 7);
    else if (period === "year") from.setFullYear(from.getFullYear() - 1);
    else from.setMonth(from.getMonth() - 1);
    return from;
}

export const getReportSummary = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const fromDate = getFromDate(req.query.period);
        const [sales, saleItems, purchases, inventory] = await Promise.all([
            db.collection("sales").find({ created_at: { $gte: fromDate } }).toArray(),
            db.collection("sale_items").find({}).toArray(),
            db.collection("purchases").find({ purchase_date: { $gte: fromDate } }).toArray(),
            db.collection("inventory").find({}).toArray(),
        ]);

        const salesIds = new Set(sales.map((s: any) => s.id));
        const saleItemsInPeriod = saleItems.filter((item: any) => salesIds.has(item.sale_id));
        const inventoryCategory = new Map(inventory.map((item: any) => [item.id, item.category ?? "Lainnya"]));

        const grossRevenue = sales.reduce((sum, row: any) => sum + Number(row.total || 0), 0);
        const totalExpenses = purchases.reduce((sum, row: any) => sum + Number(row.total_cost || 0), 0);

        const categoryMap = new Map<string, { name: string; units_sold: number; revenue: number }>();
        for (const item of saleItemsInPeriod) {
            const categoryName = String(inventoryCategory.get(item.inventory_id) ?? "Lainnya");
            const row = categoryMap.get(categoryName) ?? { name: categoryName, units_sold: 0, revenue: 0 };
            row.units_sold += Number(item.qty || 0);
            row.revenue += Number(item.subtotal || 0);
            categoryMap.set(categoryName, row);
        }

        const productMap = new Map<string, { name: string; total_qty: number; total_revenue: number }>();
        for (const item of saleItemsInPeriod) {
            const name = String(item.name);
            const row = productMap.get(name) ?? { name, total_qty: 0, total_revenue: 0 };
            row.total_qty += Number(item.qty || 0);
            row.total_revenue += Number(item.subtotal || 0);
            productMap.set(name, row);
        }

        res.json({
            sales: {
                total_sales: sales.length,
                gross_revenue: grossRevenue,
                total_expenses: totalExpenses,
                profit: grossRevenue - totalExpenses,
            },
            categories: Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue),
            topProducts: Array.from(productMap.values())
                .sort((a, b) => b.total_qty - a.total_qty)
                .slice(0, 10),
        });
    } catch (error) {
        next(error);
    }
};
