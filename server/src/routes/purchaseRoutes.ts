
import { Router } from "express";
import { getPurchases, createPurchase } from "../controllers/purchaseController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/", authorize(["admin", "manager"]), getPurchases);
router.post("/", authorize(["admin"]), createPurchase);

export default router;
