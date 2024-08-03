import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { SiteSettings } from "../entities/SiteSettings";

let globalSetting: SiteSettings | null = null;

export const getSettings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (globalSetting) {
      return res.status(200).json(globalSetting);
    }

    const settingsRepo = AppDataSource.getRepository(SiteSettings);
    const settings = await settingsRepo.find();

    if (settings.length === 0) {
      const newSettings = new SiteSettings();
      globalSetting = await settingsRepo.save(newSettings);
      return res.status(200).json(globalSetting);
    }

    globalSetting = settings[0];
    return res.status(200).json(globalSetting);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  const {
    title,
    subtitle,
    mainImage,
    category,
    introduction,
    content,
    SEO,
    cta,
    cta_link,
    cta_type,
    conclusion,
    auth,
  } = req.body;

  if (auth != process.env.AUTH_KEY)
    return res.status(408).json({ message: "Not Authorized" });

  const settingsRepo = AppDataSource.getRepository(SiteSettings);
  const settings = await settingsRepo.find();

  if (settings.length === 0) {
    const newSettings = new SiteSettings();
    //updates
    globalSetting = await settingsRepo.save(newSettings);
    return res.status(200).json(globalSetting);
  } else {
    const existingSettings = settings[0];
  }

  try {
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
