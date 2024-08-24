import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Blog } from "../entities/Blog";
import { Category } from "../entities/Category";
import { Content } from "../entities/Content";
// import { generateBlogPost } from "../utils/blog/blogGenerator";
// import { sendEmailNotification } from "../utils/mailer/sendMail";
// import { addToSitemap } from "../utils/sitemap";
// import { Tag } from "../entities/Tag";
import { Brackets, Not } from "typeorm";
import { generateAndSaveBlog } from "../utils/blog/generateAndSave";

export const generateBlog = async (req: Request, res: Response) => {
  const { title, cta_link, cta_type, image, auth } = req.body;

  if (auth != process.env.AUTH_KEY)
    return res.status(408).json({ message: "Not Authorized" });

  if (!title) return res.status(301).json({ message: "title is Required" });
  try {
    res.status(201).json({ message: "Blog generation started" });
    setTimeout(async () => {
      console.log(`Started: ${title}`);
      await generateAndSaveBlog(title, cta_type, cta_link, image);
    }, 100);
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const createBlog = async (req: Request, res: Response) => {
  const { title, contentText, categoryId } = req.body;

  try {
    const blogRepository = AppDataSource.getRepository(Blog);
    const categoryRepository = AppDataSource.getRepository(Category);
    const contentRepository = AppDataSource.getRepository(Content);

    return res.status(201).json({ message: "Blog created successfully" });
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogRepository = AppDataSource.getRepository(Blog);
    const blogs = await blogRepository.find({
      relations: ["category"],
    });

    return res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getLatestBlogs = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, lang = "en" } = req.query;

  try {
    const blogRepository = AppDataSource.getRepository(Blog);
    const [blogs, total] = await blogRepository.findAndCount({
      relations: ["category", "translations"],
      order: { createdAt: "DESC" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const totalPages = Math.ceil(total / Number(limit));

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
        category: blog.category,
        tags: blog.tags,
        title: translation?.title,
        subtitle: translation?.subtitle,
        overview: translation?.overview,
        author: translation?.author,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      };
    });

    return res.status(200).json({
      data: Blogs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getBlogBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { lang = "en" } = req.query;

  try {
    const blogRepository = AppDataSource.getRepository(Blog);

    // Fetch the main blog with related entities
    const blog = await blogRepository.findOne({
      where: { slug },
      relations: [
        "category",
        "subcategory",
        "contents",
        "comments",
        "tags",
        "translations",
      ],
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Get translations and content for the main blog
    const translation =
      blog.translations.find((t) => t.language === lang) ||
      blog.translations.find((t) => t.language === "en");
    const content =
      blog.contents.find((c) => c.language === lang) ||
      blog.contents.find((c) => c.language === "en");

    // Building related blogs query with translations
    const relatedBlogsQuery = blogRepository
      .createQueryBuilder("blog")
      .leftJoinAndSelect("blog.translations", "translation") // Include translations relation
      .leftJoinAndSelect("blog.tags", "tag") // Include tags for filtering
      .where("blog.id != :blogId", { blogId: blog.id })
      .andWhere(
        new Brackets((qb) =>
          qb
            .where("tag.id IN (:...tagIds)", {
              tagIds: blog.tags.map((tag) => tag.id),
            })
            .orWhere("tag.id IS NULL")
        )
      )
      .orderBy("blog.createdAt", "DESC")
      .limit(6);

    const relatedBlogs = await relatedBlogsQuery.getMany();

    // Fetch additional blogs if not enough related blogs
    if (relatedBlogs.length < 6) {
      const additionalBlogs = await blogRepository
        .createQueryBuilder("blog")
        .leftJoinAndSelect("blog.translations", "translation")
        .leftJoinAndSelect("blog.category", "category")
        .where("blog.id != :blogId", { blogId: blog.id })
        .andWhere("blog.category.id = :categoryId", {
          categoryId: blog.category.id,
        })
        .orderBy("blog.createdAt", "DESC")
        .take(6 - relatedBlogs.length)
        .getMany();

      relatedBlogs.push(...additionalBlogs);
    }

    // Process related blogs to include translations
    const relatedBlogsWithTranslations = relatedBlogs.map((relatedBlog) => {
      const relatedTranslation =
        relatedBlog.translations.find((t) => t.language === lang) ||
        relatedBlog.translations.find((t) => t.language === "en");

      return {
        id: relatedBlog.id,
        slug: relatedBlog.slug,
        mainImage: relatedBlog.mainImage,
        status: relatedBlog.status,
        views: relatedBlog.views,
        featured: relatedBlog.featured,
        category: relatedBlog.category,
        subcategory: relatedBlog.subcategory,
        tags: relatedBlog.tags,
        title: relatedTranslation?.title,
        subtitle: relatedTranslation?.subtitle,
        overview: relatedTranslation?.overview,
        author: relatedTranslation?.author,
        createdAt: relatedBlog.createdAt,
        updatedAt: relatedBlog.updatedAt,
      };
    });

    return res.status(200).json({
      blog: {
        id: blog.id,
        slug: blog.slug,
        mainImage: blog.mainImage,
        status: blog.status,
        views: blog.views,
        featured: blog.featured,
        category: blog.category,
        subcategory: blog.subcategory,
        tags: blog.tags,
        title: translation?.title,
        subtitle: translation?.subtitle,
        overview: translation?.overview,
        author: translation?.author,
        introduction: content?.introduction,
        content: content?.content,
        SEO: content?.SEO,
        cta: content?.cta,
        cta_link: content?.cta_link,
        cta_type: content?.cta_type,
        conclusion: content?.conclusion,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      },
      related: relatedBlogsWithTranslations,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// export const getBlogBySlug = async (req: Request, res: Response) => {
//   const { slug } = req.params;
//   const { lang = "en" } = req.query;

//   try {
//     const blogRepository = AppDataSource.getRepository(Blog);

//     const blog = await blogRepository.findOne({
//       where: { slug },
//       relations: [
//         "category",
//         "subcategory",
//         "contents",
//         "comments",
//         "tags",
//         "translations",
//       ],
//     });

//     if (!blog) {
//       return res.status(404).json({ message: "Blog not found" });
//     }

//     const translation =
//       blog.translations.find((t) => t.language === lang) ||
//       blog.translations.find((t) => t.language === "en");
//     const content =
//       blog.contents.find((c) => c.language === lang) ||
//       blog.contents.find((c) => c.language === "en");

//     // Building related blogs query
//     let relatedQuery = blogRepository
//       .createQueryBuilder("blog")
//       .orderBy("blog.createdAt", "DESC")
//       .limit(6);
//     if (blog.tags.length > 0) {
//       relatedQuery = relatedQuery
//         .leftJoin("blog.tags", "tag")
//         .where(
//           new Brackets((qb) =>
//             qb
//               .where("tag.id IN (:...tagIds)", {
//                 tagIds: blog.tags.map((tag) => tag.id),
//               })
//               .andWhere("blog.id != :blogId", { blogId: blog.id })
//           )
//         )
//         .orWhere("tag.id IS NULL");
//     } else {
//       relatedQuery = relatedQuery.where("blog.id != :blogId", {
//         blogId: blog.id,
//       });
//     }

//     let relatedBlogs = await relatedQuery.getMany();
//     if (relatedBlogs.length < 6) {
//       const latestBlogs = await blogRepository.find({
//         where: { id: Not(blog.id) },
//         order: { createdAt: "DESC" },
//         take: 6 - relatedBlogs.length,
//       });
//       relatedBlogs = [...relatedBlogs, ...latestBlogs];
//     }

//     return res.status(200).json({
//       blog: {
//         id: blog.id,
//         slug: blog.slug,
//         mainImage: blog.mainImage,
//         status: blog.status,
//         views: blog.views,
//         featured: blog.featured,
//         category: blog.category,
//         subcategory: blog.subcategory,
//         tags: blog.tags,
//         title: translation?.title,
//         subtitle: translation?.subtitle,
//         overview: translation?.overview,
//         author: translation?.author,
//         introduction: content?.introduction,
//         content: content?.content,
//         SEO: content?.SEO,
//         cta: content?.cta,
//         cta_link: content?.cta_link,
//         cta_type: content?.cta_type,
//         conclusion: content?.conclusion,
//         createdAt: blog.createdAt,
//         updatedAt: blog.updatedAt,
//       },
//       related: relatedBlogs,
//     });
//   } catch (error) {
//     console.error("Error fetching blog:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
