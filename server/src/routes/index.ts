
import { Router } from "express";
import authRoutes from "./authRoutes";
import categoryRoutes from "./categoryRoutes";
import inventoryRoutes from "./inventoryRoutes";
import cashierRoutes from "./cashierRoutes";
import dashboardRoutes from "./dashboardRoutes";
import reportRoutes from "./reportRoutes";
import supplierRoutes from "./supplierRoutes";
import purchaseRoutes from "./purchaseRoutes";
import healthRoutes from "./healthRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/cashier", cashierRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/health", healthRoutes);

export default router;
