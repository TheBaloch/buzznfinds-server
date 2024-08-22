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
 * Translate the blog via gpt-4o-mini and save the translations.
 * @param {number} blogID - The id of the blog post.
 * @param {string} language - 2 letter iso language code
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
    translatedContent.introduction = await translateHTML(
      englishContent.introduction,
      language
    );
    translatedContent.content = await translateHTML(
      englishContent.content,
      language
    );
    translatedContent.SEO = await translateJSON(englishContent.SEO, language);
    translatedContent.cta = await translateText(englishContent.cta, language);
    translatedContent.cta_link = englishContent.cta_link;
    translatedContent.cta_type = englishContent.cta_type;
    translatedContent.conclusion = await translateHTML(
      englishContent.conclusion,
      language
    );
    translatedContent = await contentRepository.save(translatedContent);

    let translatedBlogTranslation = new BlogTranslation();
    translatedBlogTranslation.language = language;
    translatedBlogTranslation.title = await translateText(
      englishBlogTranslation.title,
      language
    );
    translatedBlogTranslation.subtitle = await translateText(
      englishBlogTranslation.subtitle,
      language
    );
    translatedBlogTranslation.overview = await translateText(
      englishBlogTranslation.overview,
      language
    );
    translatedBlogTranslation.author = await translateJSON(
      englishBlogTranslation.author,
      language
    );
    translatedBlogTranslation = await blogTranslationRepository.save(
      translatedBlogTranslation
    );

    blog.contents.push(translatedContent);
    blog.translations.push(translatedBlogTranslation);
    blogRepository.save(blog);

    addToSitemap(
      `${process.env.CLIENT_URL}/${language}/${process.env.BLOG_PATH}/${blog.slug}`
    );
    console.log(`Translated: ${blog.slug} to ${language}`);
  } catch (e) {
    console.error(
      `Failed translation for blog id:${blogID} language:${language}`,
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
            "You are an assistant that translates JSON content into a specified language using a two-letter language code. Your response should contain only the translated JSON content. Do not include any extra text or explanations.",
        },
        {
          role: "user",
          content: `Translate the following JSON content into the language specified by the two-letter language code provided. Provide only the translated JSON content without any additional text.
    
    JSON Content:
    ${JSON.stringify(JSONCONTENT)}
    
    Language Code:
    ${language}`,
        },
      ],
    });

    const result = completion.choices[0].message.content?.trim();
    if (!result) {
      console.error("openai returned no resposne in api in blog generator");
      return;
    }
    const jsonStartIndex = result.indexOf("{");
    const jsonEndIndex = result.lastIndexOf("}") + 1;
    const jsonString = result.slice(jsonStartIndex, jsonEndIndex);

    const cleanJsonString = jsonString.replace(
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

async function translateHTML(HTMLCONTENT: string, language: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that translates HTML content into a specified language using a two-letter language code. Your response should contain only the translated HTML content. Do not include any extra text or explanations.",
        },
        {
          role: "user",
          content: `Translate the following HTML content into the language specified by the two-letter language code provided. Provide only the translated HTML content without any additional text.
  
  HTML Content:
  ${HTMLCONTENT}
  
  Language Code:
  ${language}`,
        },
      ],
    });

    if (!completion.choices[0].message.content)
      throw new Error("Failed to translate HTML content.");
    // Extract and return the translated HTML content
    return completion.choices[0].message.content.trim();
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
            "You are an assistant that translates plain text content into a specified language using a two-letter language code. Your response should contain only the translated text. Do not include any extra text, explanations, or formatting.",
        },
        {
          role: "user",
          content: `Translate the following text content into the language specified by the two-letter language code provided. Provide only the translated text without any additional text or formatting.
  
  Text Content:
  ${TEXTCONTENT}
  
  Language Code:
  ${language}`,
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

    // Optionally clean up any non-printable characters if needed
    const cleanText = result.replace(/[\u0000-\u001F\u007F-\u009F`]/g, "");

    return cleanText;
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error("Failed to translate text content.");
  }
}
