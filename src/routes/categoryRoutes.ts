import { Router } from "express";
import {
  getCategory,
  getCategoryBySlug,
} from "../controllers/categoryController";

const router = Router();

router.get("/category", getCategory);
router.get("/category/:slug", getCategoryBySlug);

export default router;
