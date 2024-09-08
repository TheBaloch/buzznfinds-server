import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a unique, high-quality blog post based on the provided title.
 * Ensures content is undetectable as AI-written and avoids plagiarism.
 * @param {string} title - The title of the blog post.
 * @returns {Object} The generated blog content as a JSON object.
 */
export async function generateBlogPost(title: string, cta_type: any) {
  try {
    const prompt = `Generate a long, unique blog post on the topic "${title}" following this format. The content must not trigger AI detection or be flagged as plagiarized. Focus on human-like writing styles and original insights:
{
  "title": "SEO-optimized title with power words and emotional triggers.",
  "subtitle": "Catchy subtitle that creates curiosity and complements the title.",
  "slug": "SEO-friendly slug based on the title.",
  "overview": "Engaging and unique overview of the topic, optimized for SEO.",
  "category": "Relevant main category (e.g., 'Digital Marketing').",
  "subcategory": "Appropriate subcategory (e.g., 'SEO Strategies').",
  "SEO": {
    "metaDescription": "Compelling meta description with primary keywords and a hook.",
    "metaKeywords": ["low KD keyword1", "NLP keyword2", "LSI keyword3","add more as needed"],
    "OGtitle": "Shareable title for social media with a call to action.",
    "OGdescription": "Short, engaging description for social media."
  },
  "tags": ["tag1", "tag2", "more tags","..","as many as suitable"],
  "introduction": "introduction with proper use of html tags for readability and seo",
  "content": "content with proper use of html tags for readability and seo",
  "content1": "content with proper use of html tags for readability and seo",
  "content2": "content with proper use of html tags for readability and seo",
  "conclusion": "conclusion with proper use of html tags for readability and seo",
  "callToAction": "Relevant CTA encouraging user interaction like ${cta_type}.",
  "author": {
    "name": "Authentic author name to enhance credibility.",
    "about": "Compelling author bio highlighting expertise."
  }
}`;

    const system = `Create a long, unique, and engaging blog post on the provided topic with original insights that mimic human writing and are undetectable as AI-generated. Follow these guidelines:
1. **Original Content**: Ensure all content is 100% unique with fresh perspectives, data, and insights.
2. **Human-like Tone**: Use conversational language, personal anecdotes, and storytelling to create a natural writing style. Vary sentence structure and length.
3. **SEO-Friendly**: Include low-competition keywords and naturally integrate them into headings, subheadings, and content. Focus on optimizing for featured snippets and "People Also Ask" sections.
4. **Clear Structure**: Divide the blog into distinct sections using HTML tags (<h2>, <h3>, <p>, etc.) with headings, subheadings, bullet points, and short paragraphs for readability.
5. **Engaging Introduction**: Start with a hook that captures attention, such as a compelling fact, question, or story.
6. **Diverse Content Segments**: Split the content into three main parts ('content', 'content1', and 'content2') to cover various angles and aspects of the topic in-depth.
7. **Call to Action**: Include a strong, relevant call to action at the conclusion.
8. **Output Format**: Deliver the blog post in JSON format with fields like title, subtitle, slug, overview, SEO metadata, tags, introduction, content segments, conclusion, and author information.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: system,
        },
        { role: "user", content: prompt },
      ],
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      console.error("OpenAI returned no response in API in blog generator");
      return;
    }

    const jsonStartIndex = result.indexOf("{");
    const jsonEndIndex = result.lastIndexOf("}") + 1;
    const jsonString = result.slice(jsonStartIndex, jsonEndIndex);

    const cleanJsonString = jsonString
      .replace(/[\u0000-\u001F\u007F-\u009F`]/g, "")
      .replace(/\\n/g, "")
      .replace(/\\t/g, "")
      .replace(/\\r/g, "")
      .replace(/\\(?!")/g, "");

    try {
      const blogData = JSON.parse(cleanJsonString);
      return blogData;
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      console.error("Raw JSON string after cleaning:", cleanJsonString);
      return null;
    }
  } catch (error: any) {
    console.error("Error during API call:", error.message);
    return null;
  }
}
