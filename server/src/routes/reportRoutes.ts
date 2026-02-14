
import { Router } from "express";
import { getReportSummary } from "../controllers/reportController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/summary", authorize(["admin", "manager"]), getReportSummary);

export default router;
