
import { Router } from "express";
import { checkout } from "../controllers/cashierController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.post("/checkout", authorize(["admin", "cashier"]), checkout);

export default router;
