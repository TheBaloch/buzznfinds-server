const SchemaType = {
  STRING: "string",
  OBJECT: "object",
  ARRAY: "array",
} as const;

const schema: any = {
  description:
    "Enhanced SEO-optimized blog post schema with human-like writing elements",
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description:
        "SEO-optimized title with power words and emotional triggers.",
      nullable: false,
    },
    subtitle: {
      type: SchemaType.STRING,
      description:
        "Catchy subtitle that creates curiosity and complements the title.",
      nullable: false,
    },
    slug: {
      type: SchemaType.STRING,
      description: "SEO-friendly slug based on the title.",
      nullable: false,
    },
    overview: {
      type: SchemaType.STRING,
      description:
        "Engaging and unique overview of the topic, optimized for SEO.",
      nullable: false,
    },
    category: {
      type: SchemaType.STRING,
      description: "Relevant main category (e.g., 'International Affairs').",
      nullable: false,
    },
    subcategory: {
      type: SchemaType.STRING,
      description: "Appropriate subcategory (e.g., 'Political Analysis').",
      nullable: false,
    },
    SEO: {
      type: SchemaType.OBJECT,
      properties: {
        metaTitle: {
          type: SchemaType.STRING,
          description: "An SEO-friendly meta title, under 60 characters.",
          nullable: false,
        },
        metaDescription: {
          type: SchemaType.STRING,
          description:
            "Compelling meta description with primary keywords and a hook.",
          nullable: false,
        },
        metaKeywords: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
            description: "A single keyword for SEO.",
            nullable: false,
          },
          description:
            "Array of low-competition, long-tail, and LSI keywords for SEO (max 4).",
          nullable: false,
        },
        OGtitle: {
          type: SchemaType.STRING,
          description:
            "Shareable title for social media with a call to action.",
          nullable: false,
        },
        OGdescription: {
          type: SchemaType.STRING,
          description: "Short, engaging description for social media.",
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
    tags: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
        description: "A single tag for the blog post.",
        nullable: false,
      },
      description: "Array of relevant tags for the blog post (max 4).",
      nullable: false,
    },
    introduction: {
      type: SchemaType.STRING,
      description:
        "An engaging introduction with a compelling hook, personal anecdotes, or a story that hooks the reader. Use HTML tags for formatting.",
      nullable: false,
    },
    content: {
      type: SchemaType.STRING,
      description:
        "The main body covering key aspects of the topic. Include subheadings, bullet points, relevant data, statistics, and integrate low-competition keywords naturally. Use storytelling techniques, rhetorical questions, analogies, metaphors, human-like expressions, and include expert opinions or quotes. Use HTML tags for proper formatting.",
      nullable: false,
    },
    content1: {
      type: SchemaType.STRING,
      description:
        "An additional section providing deeper insights or covering related subtopics. Include unique perspectives, recent data, case studies, and maintain engaging writing with personal anecdotes, analogies, metaphors, and human-like expressions. Use HTML tags for formatting.",
      nullable: false,
    },
    content2: {
      type: SchemaType.STRING,
      description:
        "A further section for extended discussion, advanced concepts, or future predictions. Include expert opinions, potential solutions, or calls to action. Use storytelling elements and human-like writing. Use HTML tags for proper formatting.",
      nullable: false,
    },
    conclusion: {
      type: SchemaType.STRING,
      description:
        "A strong conclusion that summarizes key points, includes a compelling call to action, and leaves a lasting impression. Use rhetorical questions or challenges to engage the reader. Use HTML tags for readability.",
      nullable: false,
    },
    callToAction: {
      type: SchemaType.STRING,
      description:
        "A compelling and relevant call to action encouraging user interaction, aligned with the content's intent. Should provide clear value propositions.",
      nullable: false,
    },
    author: {
      type: SchemaType.OBJECT,
      properties: {
        name: {
          type: SchemaType.STRING,
          description: "Real author's name to enhance credibility.",
          nullable: false,
        },
        about: {
          type: SchemaType.STRING,
          description: "Compelling author bio highlighting expertise.",
          nullable: false,
        },
      },
      required: ["name", "about"],
    },
  },
  required: [
    "slug",
    "title",
    "subtitle",
    "introduction",
    "overview",
    "content",
    "content1",
    "content2",
    "category",
    "subcategory",
    "SEO",
    "tags",
    "conclusion",
    "author",
  ],
};

const systemInstruction = `You're a professional blogger. You have to write a perfect blog on the title given in the prompt. You must follow the following instructions very carefully:
  * Ensure all content is 100% unique and original, offering fresh perspectives, data, and insights not found in existing articles.
  * IMPORTANT: Content can't be flagged as AI-written.
  * Write in a natural, conversational tone as if speaking to a friend.
  * Use personal anecdotes, real-life examples, and storytelling to create a natural writing style.
  * Vary sentence structure and length; mix short and long sentences.
  * Avoid repetitive phrases and overly formal language.
  * Include low-competition, long-tail keywords and naturally integrate them into headings, subheadings, and content. Focus on optimizing for featured snippets.
  * Use HTML tags (\`<h2>\`, \`<h3>\`, \`<p>\`, \`<ul>\`, \`<li>\`) with headings, subheadings, bullet points, lists, and short paragraphs for readability in the 'introduction', 'content', 'content1', 'content2', and 'conclusion' sections only.
  * Start with a compelling hook that captures attention, such as a fascinating fact, question, or story.
  * Organize the content into clear sections: 'Introduction', 'Content', 'Content1', 'Content2', and 'Conclusion'.
  * Split the content into three main parts ('content', 'content1', and 'content2') to cover all angles and aspects of the topic in-depth.
  * Ensure coverage of all aspects and angles and ensure minimum word count of 3000 words.
  * Use varied sentence structures and vocabulary to mimic human writing.
  * Integrate keywords naturally within the content without overstuffing.
  * Use semantic keyword variations and related terms to enhance SEO.
  * Include a strong, relevant call to action at the conclusion.
  * Demonstrate experience and expertise in the topic by providing unique insights, case studies, and data.
  * Build authoritativeness by citing reputable sources, including recent data, and incorporating quotes from industry experts to support key points.
  * Establish trustworthiness through transparency, accuracy, and by addressing user concerns comprehensively.
  * Ensure the content aligns with E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) principles to enhance credibility and SEO performance.
  * Avoid generic statements and delve deeper into specifics that provide real value to the reader.
  * Use storytelling techniques and real-world examples to make the content relatable.
  * Incorporate engaging elements like rhetorical questions, analogies, and metaphors.
  * Break down complex information into easy-to-understand segments.
  * Craft compelling CTAs that encourage users to engage, share, or take the next step.
  * Align CTAs with the content's intent and provide clear value propositions.
  * When writing about the given title, explore all relevant aspects, including causes, effects, solutions, and examples.
  * Anticipate readers' questions and address them thoroughly.
  * Identify primary and secondary keywords related to the title and integrate them naturally into the content.
  * Use creative expressions and idioms that are less likely to be generated by AI.
  * Include rhetorical questions and exclamations to mimic human writing patterns.
  * Avoid clichés and common expressions that might be flagged as AI-generated.
  * Ensure all information is accurate and up-to-date.`;

export { schema, systemInstruction };
