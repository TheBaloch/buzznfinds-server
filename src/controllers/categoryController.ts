import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Category } from "../entities/Category";

export const getCategory = async (req: Request, res: Response) => {
  try {
    const categoryRepository = AppDataSource.getRepository(Category);
    const category = await categoryRepository.find();

    return res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching Categories:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { limit } = req.query;

  try {
    const categoryRepository = AppDataSource.getRepository(Category);

    const categoryQuery = categoryRepository
      .createQueryBuilder("category")
      .leftJoinAndSelect("category.blogs", "blog")
      .where("category.slug = :slug", { slug })
      .orderBy("category.createdAt", "DESC");

    if (limit) {
      categoryQuery.limit(Number(limit));
    }

    const category = await categoryQuery.getOne();

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
