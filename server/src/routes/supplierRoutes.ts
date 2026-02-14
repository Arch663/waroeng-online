
import { Router } from "express";
import {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
} from "../controllers/supplierController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/", authorize(["admin", "manager"]), getSuppliers);
router.post("/", authorize(["admin"]), createSupplier);
router.put("/:id", authorize(["admin"]), updateSupplier);
router.delete("/:id", authorize(["admin"]), deleteSupplier);

export default router;
