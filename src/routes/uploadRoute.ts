import { Router } from "express";
import multer from "multer";
import { uploadSingleImage } from "../controllers/uploadController";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/uploadsingle", upload.single("image"), uploadSingleImage);

export default router;
