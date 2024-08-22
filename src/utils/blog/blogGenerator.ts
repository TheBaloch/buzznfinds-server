import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates an SEO-friendly blog post based on the provided title.
 * @param {string} title - The title of the blog post.
 * @returns {Object} The generated blog content as a JSON object.
 */
export async function generateBlogPost(title: string, cta_type: any) {
  try {
    const prompt = `Generate a blog post on the topic "${title}" that meets the following requirements:
* Content is human-written and not detected as AI-written.
* Content is unique and original.
* Content is user engaging and interesting.
* Content stucture is fun.
* Content is up-to-date.
* Content is structured in HTML tags that I can use in Next.js.
* Content is at least 2500 words or more.
* Content is fully SEO optimized and friendly.

Ensure the blog post includes:
- A comprehensive introduction that provides an overview of the topic.
- Multiple detailed sections with subsections where necessary.
- Elaboration on each point with examples, case studies, and expert opinions.
- Detailed explanations and expansions on the implications and applications of the topic.
- Personal insights or anecdotal evidence to enrich the content.
- An in-depth conclusion that summarizes the key points and suggests future directions.

Return the result in the following JSON only format with no additional text:

{
  "title": "Craft a catchy and SEO-optimized title that aligns with the blog's topic.",
  "subtitle": "Create a catchy and engaging subtitle that complements the title.",
  "slug": "Generate an SEO-friendly slug based on the title.",
  "overview": "Write a brief, SEO-friendly overview that captures the essence of the title and engages readers.",
  "category": "Assign a relevant main category, such as 'Technology', 'Health', etc.",
  "subcategory": "Assign an appropriate subcategory under the main category.",
  "SEO": {
    "metaDescription": "Write a brief, compelling meta description that includes main keywords and summarizes the blog post.",
    "metaKeywords": ["keyword1", "keyword2", "keyword3", "additional relevant keywords"],
    "OGtitle": "Craft a compelling and shareable title for social media.",
    "OGdescription": "Write a short, engaging description for social media sharing that summarizes the blog post."
  },
  "tags": ["tag1", "tag2", "tag3", "additional relevant tags"],
  "introduction": "<p>Write an engaging introduction related to the topic, in HTML format.</p>",
  "content": "Create detailed, relevant HTML content that exceeds 2500 words, structured for readability and SEO.",
  "conclusion": "<p>Write a concise and thoughtful conclusion in HTML format.</p>",
  "callToAction": "Generate a relevant call-to-action text tailored to ${cta_type}, encouraging reader engagement.",
  "author": {
    "name": "Generate an authentic author name that fits the tone and subject of the blog. Consider historical figures or well-known names related to the topic for inspiration.",
    "about": "Write a compelling author bio that highlights expertise and background relevant to the blog topic, including notable achievements and experience."
  }
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a skilled content writer with expertise in creating SEO-optimized blog posts. Your writing should be engaging, informative, and tailored to the given topic.",
        },
        { role: "user", content: prompt },
      ],
    });

    const result = completion.choices[0].message.content;
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
    try {
      const blogData = JSON.parse(cleanJsonString);
      return blogData;
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      console.error("Raw JSON string:", cleanJsonString);
      return null;
    }
  } catch (error) {
    console.error("Error during API call:", error);
    return null;
  }
}
