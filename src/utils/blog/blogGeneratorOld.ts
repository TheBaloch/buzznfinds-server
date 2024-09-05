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

    const system = `These guidelines are designed to produce high-quality, engaging content about the history and current affairs of various countries. The content should captivate readers, encouraging exploration while remaining optimized for search engines. Follow these instructions closely:
1. Human-like Writing:
	Create original narratives that reflect the nuances of human expression.
	Use natural, engaging language that resonates emotionally with readers.
2. Engaging and Exploratory Storytelling:
	Craft immersive journeys through a country’s history and current events.
	Utilize vivid storytelling techniques to maintain reader curiosity and interest.
3. Originality and Plagiarism Avoidance:
	Ensure all content is 100% original and free from plagiarism.
	Do not copy or closely paraphrase existing content from other sources.
4. SEO Optimization:
	Incorporate low-competition, long-tail keywords relevant to the topic.
	Prioritize niche, low-ranking keywords to improve search engine visibility and attract targeted traffic.
5. Tone and Audience Awareness:
	Maintain a friendly and informative tone, tailored to the interests and curiosities of your target audience.
    Aim for a tone that is both knowledgeable and conversational, making the reader feel as if they are on a journey through the country with an enthusiastic guide.
6. Encourage Further Exploration:
	Conclude with thought-provoking questions or prompts that invite readers to delve deeper into the topic.
7. Technical Output Guidelines:
    Return only JSON format with no additional text or text formatting
	Ensure content is compatible with JSON formatting.
	Use JSON.stringify() to format outputs.
	Sanitize input to remove non-printable characters or unwanted escape sequences.
	Confirm that all outputs are encoded in UTF-8 to prevent encoding issues.
By following these guidelines, the content will align with the unique needs of the target audience while performing well in search engines.`;

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
