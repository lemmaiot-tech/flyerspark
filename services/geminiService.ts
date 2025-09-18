import { GoogleGenAI, Type, Content, Part } from "@google/genai";
import { AiResponse, VisualElements, DesignMode, OutputFormat, StructuredContent, SearchResult, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ideaGeneratorSchema = {
  type: Type.OBJECT,
  properties: {
    toolName: {
      type: Type.STRING,
      description: 'A creative and short name for this AI flyer design assistant tool. It should be catchy and memorable.'
    },
    designIdea: {
      type: Type.OBJECT,
      properties: {
        concept: {
          type: Type.STRING,
          description: 'A brief, one-sentence summary of the overall design concept or theme, inspired by the user\'s context. It should also include a brief note on why the chosen color palette is effective for contrast and readability.',
        },
        titleSuggestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'A list of 3-4 catchy title or headline suggestions for the flyer.',
        },
        suggestedContent: {
            type: Type.STRING,
            description: 'A short paragraph (2-3 sentences) of suggested body content/copy for the flyer based on the provided context and caption.'
        },
        ctas: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'A list of 2-3 compelling call-to-action (CTA) phrases.',
        },
        visuals: {
          type: Type.OBJECT,
          properties: {
            iconStyle: { type: Type.STRING, description: 'A suggested style for icons, e.g., "Minimalist line art" or "Colorful flat icons".' },
            background: { type: Type.STRING, description: 'A suggestion for the flyer\'s background, e.g., "Abstract geometric pattern" or "Soft gradient from blue to purple".' },
            imageSuggestions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: 'A list of 2-3 specific placeholder image descriptions, e.g., "A high-quality photo of a steaming cup of coffee" or "An illustration of diverse people collaborating".'
            }
          },
          required: ['iconStyle', 'background', 'imageSuggestions'],
          description: 'A set of specific suggestions for visual elements, broken down into icon style, background, and image placeholders.',
        },
        colorPalette: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "e.g., Primary, Secondary, Accent, Background" },
              hex: { type: Type.STRING, description: "The hex color code, e.g., #FFFFFF" },
            },
            required: ['name', 'hex']
          },
          description: 'A suggested color palette with 4 complementary, high-contrast colors suitable for accessibility (WCAG AA). If a logo or brand color was provided, these colors should be inspired by or complementary to them while maintaining high contrast.',
        },
        modeSpecificContent: {
          type: Type.STRING,
          description: "Detailed, structured content suggestion based on the selected design mode. If 'Carousel', provide formatted content for 3-4 slides (e.g., using Slide 1:, Slide 2:). If 'Quiz', provide 2-3 questions with options and answers. If 'Video/Animation' or 'Reel', suggest a brief script or storyboard. If 'Infographic', suggest key data points and sections. For 'Standard Flyer', this can be a more detailed version of the main content."
        }
      },
      required: ['concept', 'titleSuggestions', 'suggestedContent', 'ctas', 'visuals', 'colorPalette', 'modeSpecificContent']
    }
  },
  required: ['toolName', 'designIdea']
};


export const generateFlyerIdeas = async (context: string, caption: string, logoBase64: string | null, brandColor: string, mode: DesignMode): Promise<AiResponse> => {
  const textPrompt = `
    Based on the following flyer details, generate a cohesive set of design suggestions.
    The output must be a JSON object matching the provided schema.
    Ensure the tool name you create is short and catchy.
    The design ideas should be creative, modern, and relevant to the context.

    **Accessibility is critical**: When generating the \`colorPalette\`, you must ensure the colors have sufficient contrast ratios for readability, especially between background colors and potential text colors (like primary or secondary). Aim for combinations that would meet WCAG AA standards. In the \`designIdea.concept\`, you must briefly mention how the chosen color palette ensures good readability and visual clarity due to its high contrast.
    
    ${logoBase64 ? 'A user has provided their logo. Analyze the logo for its style, colors, and overall brand identity. The color palette, typography, and visual suggestions should be strongly inspired by or complementary to the provided logo to ensure brand consistency.' : ''}
    ${brandColor ? `A user has also provided their primary brand color: ${brandColor}. This color MUST be featured prominently in the suggested color palette (e.g., as the 'Primary' or 'Accent' color). The rest of the palette should be complementary to this color, while still maintaining high contrast for accessibility.` : ''}

    **Flyer Context:** ${context}
    **Flyer Caption:** ${caption}
    **Design Mode:** ${mode}
  `;

  const textPart: Part = { text: textPrompt };
  const parts: Part[] = [textPart];

  if (logoBase64) {
    const [header, data] = logoBase64.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    const imagePart: Part = {
      inlineData: {
        mimeType,
        data,
      },
    };
    parts.unshift(imagePart); // Add logo as the first part
  }

  const contents: Content = { parts };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: ideaGeneratorSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedJson: AiResponse = JSON.parse(jsonString);
    
    // Basic validation
    if (!parsedJson.toolName || !parsedJson.designIdea) {
        throw new Error("Invalid response structure from AI.");
    }

    return parsedJson;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate design ideas from the AI. Please check your API key and try again.");
  }
};

const contentStructurerSchemas = {
  'Flyer / Poster': {
    type: Type.OBJECT,
    properties: {
      headlines: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 3-4 catchy headline suggestions.' },
      body: { type: Type.STRING, description: 'A concise and persuasive body text, rewritten from the source content.' },
      keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A bulleted list of 3-5 key features or benefits.' },
      ctas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 2-3 clear and compelling call-to-action phrases.' },
    },
    required: ['headlines', 'body', 'keyFeatures', 'ctas']
  },
  'Brochure': {
    type: Type.OBJECT,
    properties: {
        frontPanel: {
            type: Type.OBJECT,
            properties: {
                headline: { type: Type.STRING, description: 'A powerful headline for the front panel.' },
                tagline: { type: Type.STRING, description: 'An engaging tagline or sub-headline.' },
            },
            required: ['headline', 'tagline']
        },
        innerPanels: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: 'A title for an inner panel section.' },
                    content: { type: Type.STRING, description: 'Detailed content for that section, broken down into a paragraph.' },
                },
                required: ['title', 'content']
            },
            description: 'Content for 2-3 inner panels, detailing different aspects.'
        },
        backPanel: {
            type: Type.OBJECT,
            properties: {
                cta: { type: Type.STRING, description: 'A final call-to-action on the back panel.' },
                contactInfo: { type: Type.STRING, description: 'Contact information (e.g., website, phone, address).' },
            },
            required: ['cta', 'contactInfo']
        },
    },
    required: ['frontPanel', 'innerPanels', 'backPanel']
  },
  'Social Media Post': {
    type: Type.OBJECT,
    properties: {
      hook: { type: Type.STRING, description: 'An attention-grabbing first sentence or question to stop the scroll.' },
      body: { type: Type.STRING, description: 'The main content of the post, written in a conversational tone.' },
      hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 5-7 relevant hashtags.' },
      cta: { type: Type.STRING, description: 'A clear call-to-action for the post (e.g., "Link in bio!", "Comment below!").' },
    },
    required: ['hook', 'body', 'hashtags', 'cta']
  },
  'Article / Blog Post': {
    type: Type.OBJECT,
    properties: {
      titleSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 3-4 engaging title ideas for the article.' },
      introduction: { type: Type.STRING, description: 'A compelling introductory paragraph that hooks the reader.' },
      sections: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: 'A clear and descriptive title for a section of the article.' },
                content: { type: Type.STRING, description: 'The body content for that section, organized into paragraphs.' },
            },
            required: ['title', 'content']
        },
        description: 'The main body of the article, broken down into 2-4 logical sections.'
      },
      conclusion: { type: Type.STRING, description: 'A concluding paragraph that summarizes the key points and provides a final takeaway.' },
    },
    required: ['titleSuggestions', 'introduction', 'sections', 'conclusion']
  }
};

export const structureContent = async (content: string, format: OutputFormat): Promise<StructuredContent> => {
    const schema = contentStructurerSchemas[format];
    if (!schema) {
        throw new Error(`Unsupported format for content structuring: ${format}`);
    }

    let instructionPrompt: string;

    switch (format) {
        case 'Flyer / Poster':
            instructionPrompt = `You are an expert copywriter tasked with turning raw text into compelling content for a flyer or poster. Analyze the original content and restructure it into the following components:
- **Headlines**: Generate 3-4 catchy, attention-grabbing headlines.
- **Body**: Rewrite the core message into a concise and persuasive body text. It should be easy to read at a glance.
- **Key Features**: Extract and list 3-5 of the most important features, benefits, or selling points as a bulleted list.
- **Calls to Action (CTAs)**: Create 2-3 clear, strong calls to action that tell the reader what to do next.`;
            break;
        case 'Brochure':
            instructionPrompt = `You are a marketing specialist designing a tri-fold brochure. Structure the provided content to fit a standard brochure layout. Break it down as follows:
- **Front Panel**: Create a powerful headline and an engaging tagline. This is the first thing people see, so it must be compelling.
- **Inner Panels**: Divide the main information into 2-3 logical sections. Each section should have a clear title and detailed content. This is where you elaborate on the product, service, or event.
- **Back Panel**: Write a final, strong call to action and extract or create placeholder contact information (e.g., website, phone number, address).`;
            break;
        case 'Social Media Post':
            instructionPrompt = `You are a social media manager creating an engaging post. Convert the provided content into a format optimized for social platforms like Instagram or Facebook. Follow this structure:
- **Hook**: Write an attention-grabbing first sentence or a question to stop users from scrolling.
- **Body**: Rewrite the main content in a conversational and easy-to-read tone. Use short paragraphs and emojis where appropriate.
- **Call to Action (CTA)**: Provide a clear and direct call to action (e.g., "Click the link in bio!", "Comment your thoughts below!").
- **Hashtags**: Generate a list of 5-7 relevant and trending hashtags to increase reach.`;
            break;
        case 'Article / Blog Post':
            instructionPrompt = `You are a skilled editor structuring raw text into a well-organized article or blog post. Your task is to organize the content for maximum readability and engagement. Use the following structure:
- **Title Suggestions**: Provide 3-4 engaging and SEO-friendly title ideas.
- **Introduction**: Write a compelling introductory paragraph that hooks the reader and briefly explains what the article is about.
- **Sections**: Break down the main body of the content into 2-4 logical sections. Each section must have a clear, descriptive title. The content within each section should be well-written and informative.
- **Conclusion**: Write a concluding paragraph that summarizes the key points and provides a final takeaway or call to action for the reader.`;
            break;
        default:
            instructionPrompt = `Analyze the following text content and restructure it into a well-organized format for a "${format}". Extract the key information and rewrite it to be clear, concise, and engaging for the target format.`;
    }

    const prompt = `
        ${instructionPrompt}

        The output must be a JSON object matching the provided schema. Do not deviate from the schema structure. Base your output entirely on the original content provided below.

        **Original Content:**
        ${content}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonString = response.text.trim();
        const parsedJson: StructuredContent = JSON.parse(jsonString);

        return parsedJson;
    } catch (error) {
        console.error("Error calling Gemini API for content structuring:", error);
        throw new Error("Failed to structure content from the AI. Please try again.");
    }
};

const regenerateSchema = {
    type: Type.OBJECT,
    properties: {
        visuals: {
          type: Type.OBJECT,
          properties: {
            iconStyle: { type: Type.STRING, description: 'A new and creative suggested style for icons, different from any previous suggestion.' },
            background: { type: Type.STRING, description: 'A new and creative suggestion for the flyer\'s background.' },
            imageSuggestions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: 'A list of 2-3 new and specific placeholder image descriptions.'
            }
          },
          required: ['iconStyle', 'background', 'imageSuggestions'],
          description: 'A new set of specific suggestions for visual elements, distinct from previous ideas.',
        },
        suggestedContent: {
            type: Type.STRING,
            description: 'A new, alternative short paragraph (2-3 sentences) of suggested body content/copy for the flyer. It should be creative and distinct from any previous suggestion.'
        }
    },
    required: ['visuals', 'suggestedContent']
}

export const regenerateContentAndVisuals = async (context: string): Promise<{ visuals: VisualElements; suggestedContent: string; }> => {
    const prompt = `
        Based on the following flyer context, generate a new, alternative set of visual element ideas and a new paragraph of suggested content.
        The output must be a JSON object matching the provided schema.
        The ideas should be creative and distinct from any previous suggestions.

        **Flyer Context:** ${context}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: regenerateSchema,
            },
        });

        const jsonString = response.text.trim();
        const parsedJson: { visuals: VisualElements; suggestedContent: string; } = JSON.parse(jsonString);

        if (!parsedJson.visuals || !parsedJson.suggestedContent) {
            throw new Error("Invalid response structure for regeneration from AI.");
        }

        return parsedJson;

    } catch (error) {
        console.error("Error calling Gemini API for regeneration:", error);
        throw new Error("Failed to generate new ideas from the AI.");
    }
}

export const generatePlaceholderImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        const base64ImageBytes: string | undefined = response.generatedImages[0]?.image?.imageBytes;

        if (!base64ImageBytes) {
            throw new Error("AI did not return an image.");
        }

        return base64ImageBytes;

    } catch (error) {
        console.error("Error calling Gemini API for image generation:", error);
        throw new Error("Failed to generate an image from the AI.");
    }
};

export const fetchRealTimeInfo = async (query: string): Promise<SearchResult> => {
  const prompt = `
    Based on a real-time Google Search, provide a concise summary about "${query}".
    The summary should be objective and informative, suitable for gathering context to create a marketing flyer.
    Highlight key facts, dates, or unique selling points. Keep the summary under 100 words.
    Do not add any conversational fluff or introductory phrases like "Here is a summary...". Just provide the summary directly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summary = response.text;
    // FIX: The type from the Gemini API for grounding chunks has optional properties.
    // We must filter for valid chunks (with a URI) and map the response to match our strict internal 'GroundingChunk' type.
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingChunk[] = groundingChunks
      .filter(chunk => chunk.web?.uri)
      .map(chunk => ({
        web: {
          uri: chunk.web!.uri!,
          title: chunk.web!.title || chunk.web!.uri!,
        },
      }));

    if (!summary) {
        throw new Error("AI did not return a summary.");
    }
    
    return { summary, sources };
    
  } catch (error) {
    console.error("Error calling Gemini API with Google Search:", error);
    throw new Error("Failed to fetch real-time information from the AI.");
  }
};
