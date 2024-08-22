import { AppDataSource } from "../../config/database";
import { Blog } from "../../entities/Blog";
import { BlogTranslation } from "../../entities/BlogTranslation";
import { Category } from "../../entities/Category";
import { Content } from "../../entities/Content";
import { SubCategory } from "../../entities/SubCategory";
import { Tag } from "../../entities/Tag";
import { addToSitemap } from "../sitemap";
import { generateBlogPost } from "./blogGenerator";
import blogTranslate from "./blogTranslator";

export async function generateAndSaveBlog(
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
      const subcategoryRepository = AppDataSource.getRepository(SubCategory);
      const blogRepository = AppDataSource.getRepository(Blog);
      const blogTranslationRepository =
        AppDataSource.getRepository(BlogTranslation);
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
        name: generatedBlogData.category,
      });
      if (!category) {
        category = new Category();
        category.name = generatedBlogData.category;
        category.slug = slugify(generatedBlogData.category);
        category = await categoryRepository.save(category);
      }

      let subcategory = await subcategoryRepository.findOneBy({
        name: generatedBlogData.subcategory,
      });
      if (!subcategory) {
        subcategory = new SubCategory();
        subcategory.name = generatedBlogData.subcategory;
        subcategory.slug = slugify(generatedBlogData.subcategory);
        subcategory = await subcategoryRepository.save(subcategory);
      }

      let content = new Content();
      content.language = "en";
      content.introduction = generatedBlogData.introduction;
      content.content = generatedBlogData.content;
      content.conclusion = generatedBlogData.conclusion;
      content.cta = generatedBlogData.callToAction;
      content.SEO = generatedBlogData.SEO;
      content.cta_type = cta_type || "";
      content.cta_link = cta_link || "";
      content = await contentRepository.save(content);

      let blogTranslation = new BlogTranslation();
      blogTranslation.language = "en";
      blogTranslation.title = generatedBlogData.title;
      blogTranslation.subtitle = generatedBlogData.subtitle;
      blogTranslation.overview = generatedBlogData.overview;
      blogTranslation.author = generatedBlogData.author;
      blogTranslation = await blogTranslationRepository.save(blogTranslation);

      let blog = new Blog();
      blog.category = category;
      blog.contents = [content];
      blog.translations = [blogTranslation];
      blog.slug = generatedBlogData.slug;
      blog.tags = tags;
      blog.mainImage = mainImage;
      blog.status = "published";

      const finalBlog = await blogRepository.save(blog);
      addToSitemap(
        `${process.env.CLIENT_URL}/en/${process.env.BLOG_PATH}/${finalBlog.slug}`
      );
      console.log(`Generated: ${blog.slug}`);
      await blogTranslate(finalBlog.id, "es");
      await blogTranslate(finalBlog.id, "fr");
      await blogTranslate(finalBlog.id, "de");
      await blogTranslate(finalBlog.id, "ar");

      // const text = `Link: ${process.env.BLOG_URL}/${finalBlog.slug}`;
      // const subject = "Blog Generated";
      // await sendEmailNotification(subject, text);
      // console.log(`Generated: ${process.env.BLOG_URL}/${finalBlog.slug}`);
    } else {
      // const text = `Failed: ${title}`;
      // const subject = "Blog Failed";
      // await sendEmailNotification(subject, text);
      console.log(`Failed: ${title}`);
    }
  } catch (e) {
    // const text = `Failed: ${title}`;
    // const subject = "Blog Failed";
    // await sendEmailNotification(subject, text);
    console.log(`Failed: ${e}`);
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove all non-word characters, except whitespace and hyphen
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen
}
