
import { Router } from "express";
import {
    getInventory,
    createInventory,
    updateInventory,
    deleteInventory,
    getInventoryMovements,
} from "../controllers/inventoryController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/", getInventory);
router.post("/", authorize(["admin"]), createInventory);
router.put("/:id", authorize(["admin"]), updateInventory);
router.delete("/:id", authorize(["admin"]), deleteInventory);
router.get("/:id/movements", authorize(["admin", "manager"]), getInventoryMovements);

export default router;
