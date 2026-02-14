
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { pool } from "../db";

export const getDashboardSummary = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const [
            statsResult,
            lowStockResult,
            recentTransactionsResult,
            topProductsResult,
            weeklySalesResult,
            monthlySalesResult,
            dailyMonthSalesResult,
            categorySalesResult,
            weeklyPurchasesResult,
            monthlyPurchasesResult,
            weeklyProfitResult,
            monthlyProfitResult,
        ] = await Promise.all([
            pool.query<{
                omzet_today: string;
                transaksi_today: string;
                products_sold_today: string;
                low_stock_count: string;
                omzet_month: string;
                transaksi_month: string;
                purchases_today: string;
                purchases_month: string;
            }>(`
      SELECT
        COALESCE(SUM(total) FILTER (WHERE created_at::date = CURRENT_DATE), 0)::text AS omzet_today,
        COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::text AS transaksi_today,
        COALESCE((
          SELECT SUM(si.qty)
          FROM sale_items si
          JOIN sales s ON s.id = si.sale_id
          WHERE s.created_at::date = CURRENT_DATE
        ), 0)::text AS products_sold_today,
        (SELECT COUNT(*) FROM inventory WHERE stock <= 10)::text AS low_stock_count,
        COALESCE(SUM(total) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)), 0)::text AS omzet_month,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE))::text AS transaksi_month,
        (SELECT COALESCE(SUM(total_cost), 0) FROM purchases WHERE purchase_date::date = CURRENT_DATE)::text AS purchases_today,
        (SELECT COALESCE(SUM(total_cost), 0) FROM purchases WHERE DATE_TRUNC('month', purchase_date) = DATE_TRUNC('month', CURRENT_DATE))::text AS purchases_month
      FROM sales
    `),
            pool.query<{ id: number; name: string; stock: number }>(
                `SELECT id, name, stock FROM inventory WHERE stock <= 10 ORDER BY stock ASC, name ASC LIMIT 5`,
            ),
            pool.query<{
                id: number;
                invoice_no: string;
                total: string;
                created_at: string;
            }>(
                `SELECT id, invoice_no, total, created_at FROM sales ORDER BY created_at DESC LIMIT 5`,
            ),
            pool.query<{
                inventory_id: number;
                name: string;
                sold: string;
                revenue: string;
            }>(
                `SELECT si.inventory_id, si.name, SUM(si.qty)::text AS sold, SUM(si.subtotal)::text AS revenue FROM sale_items si GROUP BY si.inventory_id, si.name ORDER BY SUM(si.qty) DESC, si.name ASC LIMIT 5`,
            ),
            pool.query<{ day: string; revenue: string }>(
                `SELECT TO_CHAR(days.day, 'Dy') AS day, COALESCE(SUM(s.total), 0)::text AS revenue FROM generate_series(CURRENT_DATE - INTERVAL '6 day', CURRENT_DATE, INTERVAL '1 day') AS days(day) LEFT JOIN sales s ON s.created_at::date = days.day::date GROUP BY days.day ORDER BY days.day`,
            ),
            pool.query<{ month: string; revenue: string }>(
                `SELECT TO_CHAR(months.month, 'Mon') AS month, COALESCE(SUM(s.total), 0)::text AS revenue FROM generate_series(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 month'), DATE_TRUNC('month', CURRENT_DATE), INTERVAL '1 month') AS months(month) LEFT JOIN sales s ON DATE_TRUNC('month', s.created_at) = months.month GROUP BY months.month ORDER BY months.month`,
            ),
            pool.query<{ day: string; revenue: string; count: string }>(
                `SELECT TO_CHAR(days.day, 'DD') AS day, COALESCE(SUM(s.total), 0)::text AS revenue, COUNT(s.id)::text AS count FROM generate_series(DATE_TRUNC('month', CURRENT_DATE), CURRENT_DATE, INTERVAL '1 day') AS days(day) LEFT JOIN sales s ON s.created_at::date = days.day::date GROUP BY days.day ORDER BY days.day`,
            ),
            pool.query<{ category: string; revenue: string }>(
                `SELECT COALESCE(c.name, 'Lainnya') as category, SUM(si.subtotal)::text as revenue
         FROM sale_items si
         LEFT JOIN inventory i ON si.inventory_id = i.id
         LEFT JOIN categories c ON i.category_id = c.id
         GROUP BY c.name
         ORDER BY revenue DESC`,
            ),
            pool.query<{ day: string; amount: string }>(
                `SELECT TO_CHAR(days.day, 'Dy') AS day, COALESCE(SUM(p.total_cost), 0)::text AS amount FROM generate_series(CURRENT_DATE - INTERVAL '6 day', CURRENT_DATE, INTERVAL '1 day') AS days(day) LEFT JOIN purchases p ON p.purchase_date::date = days.day::date GROUP BY days.day ORDER BY days.day`,
            ),
            pool.query<{ month: string; amount: string }>(
                `SELECT TO_CHAR(months.month, 'Mon') AS month, COALESCE(SUM(p.total_cost), 0)::text AS amount FROM generate_series(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 month'), DATE_TRUNC('month', CURRENT_DATE), INTERVAL '1 month') AS months(month) LEFT JOIN purchases p ON DATE_TRUNC('month', p.purchase_date) = months.month GROUP BY months.month ORDER BY months.month`,
            ),
            pool.query<{ day: string; profit: string }>(
                `SELECT TO_CHAR(days.day, 'Dy') AS day, 
                   (COALESCE(SUM(s.total), 0) - (SELECT COALESCE(SUM(total_cost), 0) FROM purchases p WHERE p.purchase_date::date = days.day::date))::text AS profit
                 FROM generate_series(CURRENT_DATE - INTERVAL '6 day', CURRENT_DATE, INTERVAL '1 day') AS days(day) 
                 LEFT JOIN sales s ON s.created_at::date = days.day::date 
                 GROUP BY days.day ORDER BY days.day`
            ),
            pool.query<{ month: string; profit: string }>(
                `SELECT TO_CHAR(months.month, 'Mon') AS month, 
                   (COALESCE(SUM(s.total), 0) - (SELECT COALESCE(SUM(total_cost), 0) FROM purchases p WHERE DATE_TRUNC('month', p.purchase_date) = months.month))::text AS profit
                 FROM generate_series(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 month'), DATE_TRUNC('month', CURRENT_DATE), INTERVAL '1 month') AS months(month) 
                 LEFT JOIN sales s ON DATE_TRUNC('month', s.created_at) = months.month 
                 GROUP BY months.month ORDER BY months.month`
            ),
        ]);

        const stats = statsResult.rows[0] ?? {
            omzet_today: "0",
            transaksi_today: "0",
            products_sold_today: "0",
            low_stock_count: "0",
            omzet_month: "0",
            transaksi_month: "0",
            purchases_today: "0",
            purchases_month: "0",
        };

        res.json({
            stats: {
                omzetToday: Number(stats.omzet_today),
                transaksiToday: Number(stats.transaksi_today),
                productsSoldToday: Number(stats.products_sold_today),
                lowStockCount: Number(stats.low_stock_count),
                omzetMonth: Number(stats.omzet_month),
                transaksiMonth: Number(stats.transaksi_month),
                profitToday: Number(stats.omzet_today) - Number(stats.purchases_today),
                profitMonth: Number(stats.omzet_month) - Number(stats.purchases_month),
            },
            lowStockItems: lowStockResult.rows.map((row: any) => ({
                id: row.id,
                name: row.name,
                stock: Number(row.stock),
            })),
            recentTransactions: recentTransactionsResult.rows.map((row: any) => ({
                id: row.id,
                invoiceNo: row.invoice_no,
                total: Number(row.total),
                createdAt: row.created_at,
            })),
            topProducts: topProductsResult.rows.map((row: any) => ({
                id: row.inventory_id,
                name: row.name,
                sold: Number(row.sold),
                revenue: Number(row.revenue),
            })),
            weeklySales: weeklySalesResult.rows.map((row: any) => ({
                day: row.day,
                revenue: Number(row.revenue),
            })),
            monthlySales: monthlySalesResult.rows.map((row: any) => ({
                month: row.month,
                revenue: Number(row.revenue),
            })),
            dailyMonthSales: dailyMonthSalesResult.rows.map((row: any) => ({
                day: row.day,
                revenue: Number(row.revenue),
                count: Number(row.count),
            })),
            categorySales: categorySalesResult.rows.map((row: any) => ({
                category: row.category,
                revenue: Number(row.revenue),
            })),
            purchaseStats: {
                purchasesToday: Number(stats.purchases_today),
                purchasesMonth: Number(stats.purchases_month),
            },
            weeklyPurchases: weeklyPurchasesResult.rows.map((row: any) => ({
                day: row.day,
                amount: Number(row.amount),
            })),
            monthlyPurchases: monthlyPurchasesResult.rows.map((row: any) => ({
                month: row.month,
                amount: Number(row.amount),
            })),
            weeklyProfit: weeklyProfitResult.rows.map((row: any) => ({
                day: row.day,
                profit: Number(row.profit),
            })),
            monthlyProfit: monthlyProfitResult.rows.map((row: any) => ({
                month: row.month,
                profit: Number(row.profit),
            })),
        });
    } catch (error) {
        next(error);
    }
};
