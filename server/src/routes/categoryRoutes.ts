
import { Router } from "express";
import { getCategories } from "../controllers/categoryController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticate, getCategories);

export default router;
