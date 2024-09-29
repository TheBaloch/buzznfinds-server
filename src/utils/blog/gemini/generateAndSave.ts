import { AppDataSource } from "../../../config/database";
import { Blog } from "../../../entities/Blog";
import { BlogTranslation } from "../../../entities/BlogTranslation";
import { Category } from "../../../entities/Category";
import { Content } from "../../../entities/Content";
import { SubCategory } from "../../../entities/SubCategory";
import { Tag } from "../../../entities/Tag";
import { addToSitemap } from "../../sitemap";
import { generateBlogPost } from "./blogGenerator";
import blogTranslate from "./blogTranslator";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAndSaveBlog(
  title: string,
  cta_type: string,
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
          const existing = await tagRepository.findOneBy({
            slug: slugify(name),
          });
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
        slug: slugify(generatedBlogData.category),
      });
      if (!category) {
        category = new Category();
        category.name = generatedBlogData.category;
        category.slug = slugify(generatedBlogData.category);
        category = await categoryRepository.save(category);
      }

      let subcategory = await subcategoryRepository.findOneBy({
        slug: slugify(generatedBlogData.subcategory),
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
      content.content1 = generatedBlogData.content1;
      content.content2 = generatedBlogData.content2;
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
      let existing = await blogRepository.findOneBy({
        slug: slugify(generatedBlogData.slug),
      });
      if (existing) {
        for (let i = 0; ; i++) {
          if (i < 3) {
            const newslug = slugify(
              await generateNewSlug(generatedBlogData.slug)
            );
            console.log("here", newslug);
            if (newslug) {
              existing = await blogRepository.findOneBy({
                slug: slugify(newslug),
              });

              if (!existing) {
                blog.slug = slugify(newslug);
                break;
              }
            }
          } else {
            existing = await blogRepository.findOneBy({
              slug: `${generatedBlogData.slug}-${i}`,
            });

            if (!existing) {
              blog.slug = `${generatedBlogData.slug}-${i}`;
              break;
            }
          }
        }
      } else {
        blog.slug = generatedBlogData.slug;
      }

      blog.category = category;
      blog.subcategory = subcategory;
      blog.contents = [content];
      blog.translations = [blogTranslation];
      blog.slug = generatedBlogData.slug;
      blog.tags = tags;
      blog.mainImage = mainImage;
      blog.status = "published";

      const finalBlog = await blogRepository.save(blog);
      addToSitemap(
        `${process.env.CLIENT_URL}/${process.env.BLOG_PATH}/${finalBlog.slug}`
      );
      console.log(`Generated: ${blog.slug}`);
      await blogTranslate(finalBlog.id, "es");
      await blogTranslate(finalBlog.id, "fr");
      await blogTranslate(finalBlog.id, "de");
      await blogTranslate(finalBlog.id, "ar");
      await blogTranslate(finalBlog.id, "ja");

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

async function generateNewSlug(existing: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

    const systemInstruction = `
        You are an expert at generating unique, SEO-friendly slugs for blog posts. 
        Please create a new slug based on the existing one, ensuring it is relevant and unique.
        only one slug without extra text.
      `;
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "text/plain",
        temperature: 0.9,
        topP: 0.9,
      },
    });
    const completion = await model.generateContent(`
        The existing slug "${existing}" is already in the database. 
        Please generate a new, unique, and relevant slug.
      `);

    if (!completion.response || !completion.response.text()) {
      console.error("Gemini returned no response.");
      throw new Error("Empty response from Gemini API.");
    }

    const result = completion.response.text().trim();
    if (!result) {
      console.error("Gemini returned an empty message content.");
      throw new Error("Empty response content from Gemini.");
    }
    const cleanText = result.replace(/[\u0000-\u001F\u007F-\u009F`]/g, "");

    return slugify(cleanText);
  } catch (error) {
    console.error("Error generating a new slug with Gemini API:", error);
    throw new Error("Failed to generate a new slug.");
  }
}
