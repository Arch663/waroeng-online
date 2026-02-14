
import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboardController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/summary", authorize(["admin", "manager"]), getDashboardSummary);

export default router;
