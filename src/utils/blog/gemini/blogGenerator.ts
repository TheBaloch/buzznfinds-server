import { schema, systemInstruction } from "./schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates a unique, high-quality blog post based on the provided title.
 * Ensures content is undetectable as AI-written and avoids plagiarism.
 * @param {string} title - The title of the blog post.
 * * @param {string} cta_type - The cta type for current blog
 * @returns {Object} The generated blog content as a JSON object.
 */
export async function generateBlogPost(title: string, cta_type: string) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.8,
        topP: 0.9,
        presencePenalty: 0.0,
      },
    });
    const prompt = `title: ${title},
    cta_for: ${cta_type}`;
    const result = await model.generateContent(prompt);
    console.log(result.response.usageMetadata);
    const json = result?.response?.text();
    return JSON.parse(json);
  } catch (error: any) {
    console.error("Error during API call:", error.message);
    return null;
  }
}
