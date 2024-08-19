import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Blog } from "../entities/Blog";
import { Category } from "../entities/Category";
import { Content } from "../entities/Content";
import { generateBlogPost } from "../utils/blog/blogGenerator";
//import { sendEmailNotification } from "../utils/mailer/sendMail";
import { addToSitemap } from "../utils/sitemap";
import { Tag } from "../entities/Tag";

export const generateBlog = async (req: Request, res: Response) => {
  const { title, cta_link, cta_type, image, auth } = req.body;

  if (auth != process.env.AUTH_KEY)
    return res.status(408).json({ message: "Not Authorized" });

  if (!title) return res.status(301).json({ message: "title is Required" });
  try {
    res.status(201).json({ message: "Blog generation started" });
    console.log(`Started: ${title}`);
    setTimeout(async () => {
      await generateAndSaveBlog(title, cta_type, cta_link, image);
    }, 280000);
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
  const { page = 1, limit = 10 } = req.query; // default values for pagination

  try {
    const blogRepository = AppDataSource.getRepository(Blog);
    const [blogs, total] = await blogRepository.findAndCount({
      relations: ["category"],
      order: { createdAt: "DESC" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const totalPages = Math.ceil(total / Number(limit));

    return res.status(200).json({
      data: blogs,
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

  try {
    const blogRepository = AppDataSource.getRepository(Blog);
    const blog = await blogRepository.findOne({
      where: { slug: slug },
      relations: ["category", "content", "comments", "tags"],
    });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    const related = await blogRepository
      .createQueryBuilder("blog")
      .innerJoin("blog.tags", "tag")
      .where("tag.id IN (:...tagIds)", {
        tagIds: blog.tags.map((tag) => tag.id),
      })
      .andWhere("blog.id != :blogId", { blogId: blog.id })
      .limit(6)
      .getMany();

    return res.status(200).json({ blog, related });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const ID = parseInt(id);

  if (isNaN(ID))
    return res.status(301).json({ message: "ID should be a number" });

  const {
    title,
    subtitle,
    mainImage,
    category, // Category name
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

  try {
    const blogRepository = AppDataSource.getRepository(Blog);
    const blog = await blogRepository.findOne({
      where: { id: ID },
      relations: ["category", "content"],
    });
    if (!blog) return res.status(404).json({ message: "Blog Not Found" });

    // Update blog fields
    blog.title = title || blog.title;
    blog.subtitle = subtitle || blog.subtitle;
    blog.mainImage = mainImage || blog.mainImage;

    // Update category if provided
    if (category) {
      const categoryRepository = AppDataSource.getRepository(Category);
      const blogCategory = await categoryRepository.findOne({
        where: { category },
      });
      if (!blogCategory)
        return res.status(404).json({ message: "Category not found" });
      blog.category = blogCategory;
    }

    // Update content fields
    const contentRepository = AppDataSource.getRepository(Content);
    const blogContent = await contentRepository.findOneBy({
      id: blog.content.id,
    });
    if (!blogContent)
      return res.status(404).json({ message: "Blog Content not found" });

    blogContent.introduction = introduction || blogContent.introduction;
    blogContent.content = content || blogContent.content;
    blogContent.SEO = SEO || blogContent.SEO;
    blogContent.cta = cta || blogContent.cta;
    blogContent.cta_link = cta_link || blogContent.cta_link;
    blogContent.cta_type = cta_type || blogContent.cta_type;
    blogContent.conclusion = conclusion || blogContent.conclusion;

    // Save updates
    await contentRepository.save(blogContent);
    await blogRepository.save(blog);

    return res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { auth } = req.body;

  if (auth != process.env.AUTH_KEY)
    return res.status(408).json({ message: "Not Authorized" });

  const ID = parseInt(id);

  if (isNaN(parseInt(id)))
    return res.status(301).json({ message: "ID should be a number" });

  try {
    const blogRepository = AppDataSource.getRepository(Blog);
    const blog = await blogRepository.findOneBy({ id: ID });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    await blogRepository.remove(blog);

    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove all non-word characters, except whitespace and hyphen
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen
}

async function generateAndSaveBlog(
  title: string,
  cta_type: string | null,
  cta_link: string | null,
  mainImage: string
) {
  try {
    // const text = `Started: ${title}`;
    // const subject = "Blog Generation Started";
    // await sendEmailNotification(subject, text);

    const generatedBlogData = await generateBlogPost(title, cta_type);
    if (generatedBlogData) {
      const categoryRepository = AppDataSource.getRepository(Category);
      const blogRepository = AppDataSource.getRepository(Blog);
      const contentRepository = AppDataSource.getRepository(Content);
      const tagRepository = AppDataSource.getRepository(Tag);

      const tags = [];
      if (generatedBlogData.tags) {
        const generatedTags = Array(...generatedBlogData.tags);
        for (const name of generatedTags) {
          const existing = await tagRepository.findOneBy({ name });
          if (existing) tags.push(existing);
          else {
            const newTag = new Tag();
            newTag.name = name;
            newTag.slug = slugify(name);
            const savedTag = await tagRepository.save(newTag);
            tags.push(savedTag);
          }
        }
      }

      let category = await categoryRepository.findOneBy({
        category: generatedBlogData.category,
      });
      if (!category) {
        category = new Category();
        category.category = generatedBlogData.category;
        category.slug = slugify(generatedBlogData.category);
        category = await categoryRepository.save(category);
        //addToSitemap(`${process.env.CLIENT_URL}/${category.slug}`);
      }

      let content = new Content();
      content.introduction = generatedBlogData.introduction;
      content.content = generatedBlogData.content;
      content.conclusion = generatedBlogData.conclusion;
      content.cta = generatedBlogData.callToAction;
      content.SEO = generatedBlogData.SEO;
      content.cta_type = cta_type || "";
      content.cta_link = cta_link || "";
      content = await contentRepository.save(content);

      let blog = new Blog();
      blog.category = category;
      blog.content = content;
      blog.title = generatedBlogData.title;
      blog.subtitle = generatedBlogData.subtitle;
      blog.overview = generatedBlogData.overview;
      blog.slug = generatedBlogData.slug;
      blog.mainImagePrompt = generatedBlogData.image;
      blog.author = generatedBlogData.author;
      blog.tags = tags;
      blog.mainImage = mainImage;
      blog.status = "published";

      const finalBlog = await blogRepository.save(blog);
      addToSitemap(`${process.env.BLOG_URL}/${finalBlog.slug}`);

      // const text = `Link: ${process.env.BLOG_URL}/${finalBlog.slug}`;
      // const subject = "Blog Generated";
      // await sendEmailNotification(subject, text);
      console.log(`Generated: ${process.env.BLOG_URL}/${finalBlog.slug}`);
    } else {
      // const text = `Failed: ${title}`;
      // const subject = "Blog Failed";
      // await sendEmailNotification(subject, text);
      console.log(`Failed: ${title}`);
    }
  } catch {
    // const text = `Failed: ${title}`;
    // const subject = "Blog Failed";
    // await sendEmailNotification(subject, text);
    console.log(`Failed: ${title}`);
  }
}
