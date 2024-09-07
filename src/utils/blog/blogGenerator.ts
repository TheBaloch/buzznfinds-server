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
    "metaKeywords": ["low KD keyword1", "NLP keyword2", "LSI keyword3"],
    "OGtitle": "Shareable title for social media with a call to action.",
    "OGdescription": "Short, engaging description for social media."
  },
  "tags": ["tag1", "tag2", "more tags","..","as many as suitable"],
  "introduction": "<p>Engaging introduction using storytelling or a hook, setting the stage for the topic.</p>",
  "content": "Detailed HTML content with unique insights, including sections with clear headings, subheadings, bullet points, quotes. Avoid redundancy while making sure the writing is varied and conversational.",
  "conclusion": "<p>Conclusion summarizing the key takeaways with a strong CTA.</p>",
  "callToAction": "Relevant CTA encouraging user interaction like ${cta_type}.",
  "author": {
    "name": "Authentic author name to enhance credibility.",
    "about": "Compelling author bio highlighting expertise."
  }
}`;

    const system = `Create a highly engaging and unique blog post with original insights that is undetectable as AI-generated and free of plagiarism. Follow these detailed instructions:

1. **Original Insights**: Ensure all content is 100% unique, providing new insights, analyses, and perspectives. Do not reuse or closely mirror any existing content.

2. **Human-Like Writing**: Vary sentence structure and use conversational language with personal anecdotes, humor, or storytelling elements to mimic natural human writing.

3. **Avoid AI Detection**: Write content that avoids typical AI detection patterns such as overly formal or generic language. Ensure diverse vocabulary and natural transitions.

4. **SEO Optimization**: Integrate low-competition keywords and optimize for snippets, "People Also Ask" sections, and other SEO features. Use the keywords naturally within headings and content.

5. **Readable and Engaging Structure**: Break up content into short paragraphs with clear headings, bullet points, and varied sentence lengths to maintain engagement. Use rhetorical questions and thought-provoking ideas to enhance engagement.

6. **Avoid Redundancy**: Ensure no repeated information or phrases. Provide new angles on the topic in each section to keep the content fresh.

7. **Content Coverage**: Endure content covers all possible aspect of the topic and is as informative as possible

8. **Output Format**: Deliver the content in JSON format as specified in the prompt.`;

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
