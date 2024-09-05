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
    const prompt = `Generate a blog post on the topic "${title}" with the following output format and additional SEO and engagement optimizations:

{
  "title": "SEO-optimized title with power words and emotional triggers.",
  "subtitle": "Catchy subtitle that creates curiosity and complements the title.",
  "slug": "SEO-friendly slug based on the title.",
  "overview": "Brief, engaging overview of the topic, optimized for SEO.",
  "category": "Relevant main category (e.g., 'Digital Marketing').",
  "subcategory": "Appropriate subcategory (e.g., 'SEO Strategies').",
  "SEO": {
    "metaDescription": "Compelling meta description with primary keywords and a hook.",
    "metaKeywords": ["low KD keyword1", "NLP keyword2", "LSI keyword3"],
    "OGtitle": "Shareable title for social media with a call to action.",
    "OGdescription": "Short, engaging description for social media."
  },
  "tags": ["SEO tips", "user engagement", "digital marketing"],
  "introduction": "<p>Attention-grabbing introduction using a hook, a question, or a surprising fact.</p>",
  "content": "Detailed HTML content including headings, subheadings, bullet points, multimedia elements, internal and external links, and engagement triggers.",
  "conclusion": "<p>Strong conclusion summarizing key points and including a call-to-action (CTA).</p>",
  "callToAction": "Relevant CTA encouraging shares, comments, or subscriptions tailored to ${cta_type}.",
  "author": {
    "name": "Authentic author name to enhance credibility.",
    "about": "Compelling author bio highlighting expertise and experience."
  }
}
`;

    const system = `Create highly engaging, SEO-optimized content designed to maximize user retention, interaction, and search visibility. Follow these enhanced instructions:

1. **Human-like Writing**: Use a conversational tone with varied sentence structures, questions, and relatable language. Incorporate storytelling elements, humor, and personal anecdotes to make the content more relatable.

2. **Advanced SEO Tactics**: Focus on low-competition, long-tail keywords and include related NLP and LSI keywords. Use keywords naturally in headings, subheadings, meta descriptions, alt texts, and throughout the body content. Optimize for featured snippets and "People Also Ask" sections by including question-based subheadings and concise answers.

3. **Unique and Plagiarism-Free Content**: Ensure all content is 100% original, adding unique perspectives, new insights, and data where possible. Include external and internal linking to credible sources and related content to improve authority.

4. **Highly Engaging Content Structure**: Use short paragraphs, bullet points, numbered lists, and eye-catching headings to make content easily scannable. Include multimedia elements like images, infographics, and videos to enhance user experience and engagement.

5. **Call-to-Action and Engagement Hooks**: Insert compelling call-to-actions (CTAs) throughout the content, encouraging comments, shares, or subscriptions. Use hooks at the beginning and end of the content to capture attention and provoke thought.

6. **Structured Data and Schema Markup**: Include structured data for FAQs, articles, or reviews to improve visibility in search results. Use schema markup to help search engines understand the content better.

7. **Social Media Optimization**: Craft shareable meta descriptions, images, and Open Graph tags to enhance social media engagement and click-through rates.

8. **Continuous Improvement**: Suggest A/B testing of headlines, CTAs, and content variations to determine the best-performing versions.
`;

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
      console.error("OpenAI returned no response in API in blog generator");
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
