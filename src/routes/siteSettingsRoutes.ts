import { Router } from "express";
import { getSettings } from "../controllers/siteSettingsController";

const router = Router();

router.get("/settings", getSettings);
//router.put("/settings", getSettings);

export default router;
