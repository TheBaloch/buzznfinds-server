import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Category } from "../entities/Category";
import { Blog } from "../entities/Blog";

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
  const { page = 1, limit = 10, lang = "en" } = req.query;

  try {
    const categoryRepository = AppDataSource.getRepository(Category);
    const blogRepository = AppDataSource.getRepository(Blog);

    const category = await categoryRepository.findOneBy({ slug });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const [blogs, total] = await blogRepository.findAndCount({
      where: { category },
      relations: ["translations", "category"],
      // order: { createdAt: "DESC" },
      // skip: (Number(page) - 1) * Number(limit),
      // take: Number(limit),
    });
    //const totalPages = Math.ceil(total / Number(limit));

    const Blogs = blogs.map((blog) => {
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
      slug: category.slug,
      name: category.name,
      blogs: {
        data: Blogs,
        // pagination: {
        //   total,
        //   page: Number(page),
        //   limit: Number(limit),
        //   totalPages,
        // },
      },
    });
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
