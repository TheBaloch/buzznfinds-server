import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Category } from "../entities/Category";

// Interface for the response data structure
interface BlogResponse {
  id: number;
  slug: string;
  mainImage: any;
  status: "draft" | "published";
  views: number;
  featured: boolean;
  category: Category;
  tags: any[];
  title: string | undefined;
  subtitle: string | undefined;
  overview: string | undefined;
  author: any;
  createdAt: Date;
  updatedAt: Date;
}

export const getCategory = async (req: Request, res: Response) => {
  try {
    const categoryRepository = AppDataSource.getRepository(Category);
    const categories = await categoryRepository.find();

    if (categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { limit } = req.query;
  const { lang } = req.query;

  try {
    const categoryRepository = AppDataSource.getRepository(Category);

    const categoryQuery = categoryRepository
      .createQueryBuilder("category")
      .leftJoinAndSelect("category.blogs", "blog")
      .leftJoinAndSelect("blog.translations", "translation")
      .orderBy("blog.createdAt", "DESC")
      .where("category.slug = :slug", { slug });

    if (limit) {
      categoryQuery.take(Number(limit));
    }

    const category = await categoryQuery.getOne();

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const blogs = category.blogs.map((blog) => {
      const translation =
        blog.translations.find((t) => t.language === lang) ||
        blog.translations.find((t) => t.language === "en");

      return {
        id: blog.id,
        slug: blog.slug,
        mainImage: blog.mainImage,
        status: blog.status,
        views: blog.views,
        featured: blog.featured,
        title: translation?.title,
        subtitle: translation?.subtitle,
        overview: translation?.overview,
        author: translation?.author,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      };
    });

    return res.status(200).json({
      id: category.id,
      slug: category.slug,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      blogs,
    });
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
