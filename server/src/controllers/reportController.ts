
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { pool } from "../db";

export const getReportSummary = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { period } = req.query;
        let interval = "1 month";
        if (period === "day") interval = "1 day";
        if (period === "week") interval = "1 week";
        if (period === "year") interval = "1 year";

        const [
            salesStatsResult,
            categoryStats,
            topPerformers,
            expenseStatsResult,
        ] = await Promise.all([
            pool.query(`
      SELECT 
        COUNT(*)::integer as total_sales,
        COALESCE(SUM(total), 0)::numeric as gross_revenue
      FROM sales
      WHERE created_at >= CURRENT_DATE - INTERVAL '${interval}'
    `),
            pool.query(`
      SELECT c.name, SUM(si.qty)::integer as units_sold, SUM(si.subtotal)::numeric as revenue
      FROM sale_items si
      JOIN inventory i ON si.inventory_id = i.id
      LEFT JOIN categories c ON i.category_id = c.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.created_at >= CURRENT_DATE - INTERVAL '${interval}'
      GROUP BY c.name
      ORDER BY revenue DESC
    `),
            pool.query(`
      SELECT name, SUM(qty)::integer as total_qty, SUM(subtotal)::numeric as total_revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.created_at >= CURRENT_DATE - INTERVAL '${interval}'
      GROUP BY name
      ORDER BY total_qty DESC
      LIMIT 10
    `),
            pool.query(`
      SELECT COALESCE(SUM(total_cost), 0)::numeric as total_expenses
      FROM purchases
      WHERE purchase_date >= CURRENT_DATE - INTERVAL '${interval}'
    `),
        ]);

        const salesStats = salesStatsResult.rows[0];
        const expenseStats = expenseStatsResult.rows[0];
        const grossRevenue = Number(salesStats.gross_revenue || 0);
        const totalExpenses = Number(expenseStats.total_expenses || 0);
        const profit = grossRevenue - totalExpenses;

        res.json({
            sales: {
                total_sales: salesStats.total_sales,
                gross_revenue: grossRevenue,
                total_expenses: totalExpenses,
                profit: profit,
            },
            categories: categoryStats.rows,
            topProducts: topPerformers.rows,
        });
    } catch (error) {
        next(error);
    }
};
