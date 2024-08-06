import { Router } from "express";
import {
  generateBlog,
  createBlog,
  getBlogs,
  getLatestBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController";

const router = Router();

router.post("/blog/generate", generateBlog);
router.post("/blog", createBlog);
router.get("/blog", getBlogs);
router.get("/latestblog", getLatestBlogs);
router.get("/blog/:slug", getBlogBySlug);
router.put("/blog/:id", updateBlog);
router.delete("/blog/:id", deleteBlog);

export default router;
