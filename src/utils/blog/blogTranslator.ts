import { AppDataSource } from "../../config/database";
import { Blog } from "../../entities/Blog";
import { BlogTranslation } from "../../entities/BlogTranslation";
import { Content } from "../../entities/Content";
import { addToSitemap } from "../sitemap";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const blog = await blogRepository.findOne({
      where: { id: blogID },
      relations: ["contents", "translations"],
    });

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

    let translatedContent = new Content();
    translatedContent.language = language;
    try {
      translatedContent.introduction = await retry(translateHTML, [
        englishContent.introduction,
        language,
      ]);
      translatedContent.content = await retry(translateHTML, [
        englishContent.content,
        language,
      ]);
      translatedContent.SEO = await retry(translateJSON, [
        englishContent.SEO,
        language,
      ]);
      translatedContent.cta = await retry(translateText, [
        englishContent.cta,
        language,
      ]);
      translatedContent.cta_link = englishContent.cta_link;
      translatedContent.cta_type = englishContent.cta_type;
      translatedContent.conclusion = await retry(translateHTML, [
        englishContent.conclusion,
        language,
      ]);
    } catch (e) {
      console.error(`Error translating content for blog id:${blogID}`, e);
      return; // Abort if translation fails
    }

    try {
      translatedContent = await contentRepository.save(translatedContent);
    } catch (e) {
      console.error(`Error saving translated content for blog id:${blogID}`, e);
      return; // Abort if saving fails
    }

    let translatedBlogTranslation = new BlogTranslation();
    translatedBlogTranslation.language = language;
    try {
      translatedBlogTranslation.title = await retry(translateText, [
        englishBlogTranslation.title,
        language,
      ]);
      translatedBlogTranslation.subtitle = await retry(translateText, [
        englishBlogTranslation.subtitle,
        language,
      ]);
      translatedBlogTranslation.overview = await retry(translateText, [
        englishBlogTranslation.overview,
        language,
      ]);
      translatedBlogTranslation.author = await retry(translateJSON, [
        englishBlogTranslation.author,
        language,
      ]);
    } catch (e) {
      console.error(
        `Error translating blog translation for blog id:${blogID}`,
        e
      );
      return; // Abort if translation fails
    }

    try {
      translatedBlogTranslation = await blogTranslationRepository.save(
        translatedBlogTranslation
      );
    } catch (e) {
      console.error(`Error saving blog translation for blog id:${blogID}`, e);
      return; // Abort if saving fails
    }

    blog.contents.push(translatedContent);
    blog.translations.push(translatedBlogTranslation);

    try {
      await blogRepository.save(blog);
    } catch (e) {
      console.error(
        `Error saving blog after translation for blog id:${blogID}`,
        e
      );
      return; // Abort if saving fails
    }

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

async function translateJSON(JSONCONTENT: any, language: string): Promise<any> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that translates JSON content into a specified language using a two-letter language code. Your response should contain only the translated JSON content in the specified language. Ensure that every string in the JSON is translated and that the structure of the JSON remains unchanged. Do not include any extra text or explanations.",
        },
        {
          role: "user",
          content: `Translate the following JSON content into the language specified by the two-letter language code provided. Ensure all translatable text within the JSON is translated, and the original content is not returned. Provide only the translated JSON content without any additional text.
        Language Code: ${language}

        JSON Content:
        ${JSON.stringify(JSONCONTENT)}`,
        },
      ],
    });

    const result = completion.choices[0].message.content?.trim();
    if (!result) {
      console.error(
        "OpenAI returned no response in the API for JSON translation."
      );
      throw new Error("Empty response from OpenAI.");
    }

    const cleanJsonString = result.replace(
      /[\u0000-\u001F\u007F-\u009F`]/g,
      ""
    );
    const translatedObject = JSON.parse(cleanJsonString);
    return translatedObject;
  } catch (error) {
    console.error("Error translating JSON:", error);
    throw new Error("Failed to translate JSON content.");
  }
}

async function translateHTML(
  HTMLCONTENT: string,
  language: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that translates HTML content into the specified language using the provided two-letter language code. Your response must contain only the translated HTML content, preserving all HTML tags and attributes, but translating all text content within the tags. Ensure the translation is accurate, grammatically correct, and uses the specified language. Do not include any extra text or explanations.",
        },
        {
          role: "user",
          content: `Translate the following HTML content into the language specified by the two-letter language code provided. Translate only the text content within the HTML tags, ensuring that the translation is accurate, grammatically correct, and in the specified language. Keep all HTML tags and attributes unchanged. Provide only the translated HTML content without any additional text.
  Language Code: ${language}

  HTML Content:
  ${HTMLCONTENT}`,
        },
      ],
    });

    const translatedContent = completion.choices[0].message.content?.trim();
    if (!translatedContent) {
      throw new Error("Failed to translate HTML content.");
    }

    return translatedContent;
  } catch (error) {
    console.error("Error translating HTML:", error);
    throw new Error("Failed to translate HTML content.");
  }
}

async function translateText(
  TEXTCONTENT: string,
  language: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that translates plain text content into the specified language using a two-letter language code. Your response must contain only the translated text, ensuring it is accurate, grammatically correct, and in the specified language. Do not include any extra text, explanations, or formatting.",
        },
        {
          role: "user",
          content: `Translate the following text content into the language specified by the two-letter language code provided. Ensure that the translation is accurate, grammatically correct, and in the specified language. Provide only the translated text without any additional text or formatting.
  Language Code: ${language}
  
  Text Content:
  ${TEXTCONTENT}`,
        },
      ],
    });

    const result = completion.choices[0].message.content?.trim();
    if (!result) {
      console.error(
        "OpenAI returned no response in the API for text translation."
      );
      throw new Error("Empty response from OpenAI.");
    }

    const cleanText = result.replace(/[\u0000-\u001F\u007F-\u009F`]/g, "");

    return cleanText;
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error("Failed to translate text content.");
  }
}
