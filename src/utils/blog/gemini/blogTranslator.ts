import { AppDataSource } from "../../../config/database";
import { Blog } from "../../../entities/Blog";
import { BlogTranslation } from "../../../entities/BlogTranslation";
import { Content } from "../../../entities/Content";
import { addToSitemap } from "../../sitemap";
import { GoogleGenerativeAI } from "@google/generative-ai";

const translationSchema: any = {
  description: "Translated to given two letter language code",
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Translated to given two letter language code",
      nullable: false,
    },
    subtitle: {
      type: "string",
      description: "Translated to given two letter language code",
      nullable: false,
    },
    overview: {
      type: "string",
      description: "Translated to given two letter language code",
      nullable: false,
    },
    author: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Translated to given two letter language code",
          nullable: false,
        },
        about: {
          type: "string",
          description: "Translated to given two letter language code",
          nullable: false,
        },
      },
      required: ["name", "about"],
    },
    SEO: {
      type: "object",
      properties: {
        metaTitle: {
          type: "string",
          description: "Translated to given two letter language code",
          nullable: false,
        },
        metaDescription: {
          type: "string",
          description: "Translated to given two letter language code",
          nullable: false,
        },
        metaKeywords: {
          type: "array",
          items: {
            type: "string",
            description: "Translated to given two letter language code",
            nullable: false,
          },
          description:
            "Array of low-competition, long-tail, and LSI keywords for SEO (max 4).",
          nullable: false,
        },
        OGtitle: {
          type: "string",
          description: "Translated to given two letter language code",
          nullable: false,
        },
        OGdescription: {
          type: "string",
          description: "Translated to given two letter language code",
          nullable: false,
        },
      },
      required: [
        "metaTitle",
        "metaDescription",
        "metaKeywords",
        "OGtitle",
        "OGdescription",
      ],
    },
    introduction: {
      type: "string",
      description:
        "Translated to given two letter language code without altering html",
      nullable: false,
    },
    content: {
      type: "string",
      description:
        "Translated to given two letter language code without altering html",
      nullable: false,
    },
    content1: {
      type: "string",
      description:
        "Translated to given two letter language code without altering html",
      nullable: false,
    },
    content2: {
      type: "string",
      description:
        "Translated to given two letter language code without altering html",
      nullable: false,
    },
    conclusion: {
      type: "string",
      description:
        "Translated to given two letter language code without altering html",
      nullable: false,
    },
    callToAction: {
      type: "string",
      description: "Translated to given two letter language code",
      nullable: false,
    },
  },
  required: [
    "title",
    "subtitle",
    "overview",
    "author",
    "introduction",
    "content",
    "content1",
    "content2",
    "callToAction",
    "SEO",
    "conclusion",
  ],
};

/**
 * Retry logic for translation functions.
 * @param fn - The function to be retried.
 * @param args - Arguments for the function.
 * @param retries - Number of retries.
 */
async function retry<T>(
  fn: (...args: any[]) => Promise<T>,
  args: any[],
  retries: number = 3
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn(...args);
    } catch (error: any) {
      lastError = error;
      console.warn(`Retry attempt ${attempt + 1} failed: ${error.message}`);
      if (attempt === retries - 1) {
        throw lastError;
      }
    }
  }
  throw lastError; // Should not reach here if retries are exhausted
}

/**
 * Translate the blog via gpt-4o-mini and save the translations.
 * @param {number} blogID - The id of the blog post.
 * @param {string} language - 2 letter ISO language code
 */
export default async function blogTranslate(blogID: number, language: string) {
  try {
    const blogRepository = AppDataSource.getRepository(Blog);
    const blogTranslationRepository =
      AppDataSource.getRepository(BlogTranslation);
    const contentRepository = AppDataSource.getRepository(Content);

    const blog = await blogRepository
      .createQueryBuilder("blog")
      .leftJoinAndSelect("blog.contents", "contents")
      .leftJoinAndSelect("blog.translations", "translations")
      .where("blog.id = :id", { id: blogID })
      .getOne();

    if (!blog) {
      console.error(`Blog with id:${blogID} not found before translation`);
      return;
    }

    const englishContent = blog.contents.find((c) => c.language === "en");
    if (!englishContent) {
      console.error(
        `Content for blog_id:${blogID} not found before translation`
      );
      return;
    }

    const englishBlogTranslation = blog.translations.find(
      (t) => t.language === "en"
    );
    if (!englishBlogTranslation) {
      console.error(
        `BlogTranslation for blog_id:${blogID} not found before translation`
      );
      return;
    }

    const toTranslate = {
      title: englishBlogTranslation.title,
      subtitle: englishBlogTranslation.subtitle,
      overview: englishBlogTranslation.overview,
      author: englishBlogTranslation.author,
      introduction: englishContent.introduction,
      content: englishContent.content,
      content1: englishContent.content1,
      content2: englishContent.content2,
      callToAction: englishContent.cta,
      SEO: englishContent.SEO,
      conclusion: englishContent.SEO,
    };

    const translated = await retry(translateToLanguage, [
      toTranslate,
      language,
    ]);

    let translatedContent = new Content();
    translatedContent.blog = blog;
    translatedContent.language = language;
    translatedContent.introduction = translated.introduction;
    translatedContent.content = translated.content;
    translatedContent.content1 = translated.content1;
    translatedContent.content2 = translated.content2;
    translatedContent.SEO = translated.SEO;
    translatedContent.cta = translated.callToAction;
    translatedContent.cta_link = englishContent.cta_link;
    translatedContent.cta_type = englishContent.cta_type;
    translatedContent.conclusion = translated.conclusion;
    translatedContent = await contentRepository.save(translatedContent);

    let translatedBlogTranslation = new BlogTranslation();
    translatedBlogTranslation.blog = blog;
    translatedBlogTranslation.language = language;
    translatedBlogTranslation.title = translated.title;
    translatedBlogTranslation.subtitle = translated.subtitle;
    translatedBlogTranslation.overview = translated.overview;
    translatedBlogTranslation.author = translated.author;
    translatedBlogTranslation = await blogTranslationRepository.save(
      translatedBlogTranslation
    );

    try {
      addToSitemap(
        `${process.env.CLIENT_URL}/${language}/${process.env.BLOG_PATH}/${blog.slug}`
      );
      console.log(`Translated: ${blog.slug} to ${language}`);
    } catch (e) {
      console.error(`Error updating sitemap for blog id:${blogID}`, e);
    }
  } catch (e) {
    console.error(
      `Failed translation process for blog id:${blogID} language:${language}`,
      e
    );
  }
}

async function translateToLanguage(data: any, language: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const systemInstruction = `Translate the given object into the specified language: ${language}. Ensure the translation is accurate and maintains proper grammar. Follow these guidelines:
1. **Preserve HTML Tags**: Do not alter or remove any HTML tags within the content.
2. **SEO Considerations**: For SEO elements (meta title, description, and keywords):
   - Keywords: Retain keywords in their original form if no direct translation exists. Avoid translating technical or brand-related terms unless appropriate.
3. **Cultural Relevance**: Adapt the translation to fit the cultural context of the target language, ensuring natural phrasing while preserving the original meaning.
4. **Author Information**: Do not translate proper nouns like the author's name. Keep author-related content intact unless there is a relevant cultural equivalent.
5. **Maintain Structure**: Ensure that the logical structure (headings, sections, paragraphs) of the content remains unchanged.
6. **Engagement and Call to Action**: Ensure that the call to action remains compelling and culturally relevant in the translated content.
The translated content should match the schema provided without losing meaning or structure. Ensure all translated text respects the format of the original.
`;
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: translationSchema,
      temperature: 0.8,
      topP: 0.9,
      presencePenalty: 0.0,
    },
  });
  const result = await model.generateContent(JSON.stringify(data));
  const translated: {
    title: string;
    subtitle: string;
    overview: string;
    author: any;
    introduction: string;
    content: string;
    content1: string;
    content2: string;
    callToAction: string;
    conclusion: string;
    SEO: any;
  } = JSON.parse(result.response.text());
  return translated;
}
