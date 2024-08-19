const OpenAI = require("openai");

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
* Content is at least 2000 words or more.
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
  "title": "Catchy title that helps in seo ranking",
  "subtitle": "Catchy subtitle",
  "slug": "seo-friendly-slug",
  "overview":"a small seo friendly overview on the title",
  "category": "Relevant category for the blog post",
  "SEO": {
    "metaDescription": "A brief, compelling summary of the blog post, including main keywords.",
    "metaKeywords": ["keyword1", "keyword2", "keyword3",........],
    "OGtitle": "A compelling title for social media sharing",
    "OGdescription": "A short description for social media sharing that summarizes the blog post."
  },
  "tags": ["tag1","tag2","tag3",.......]
  "introduction": "<p>Engaging introduction related to topic in HTML</p>",
  "image": "Prompt that will return a main blog image relevant to topic for ChatGPT API",
  "content": "ensure relevant html content over 2500 words (structured for readablitiy and seo)",
  "conclusion": "<p>Conclusion in HTML</p>",
  "callToAction": "relevant callToAction text for ${cta_type}"}",
  "author":{
      "name":"Random author name that feels authentic",
      "about":"author about related to feild about the topic"
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
