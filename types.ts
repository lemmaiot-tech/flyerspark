export type DesignMode = 'Standard Flyer' | 'Carousel' | 'Quiz' | 'Video/Animation' | 'Reel' | 'Infographic';
export type ToolMode = 'ideaGenerator' | 'contentStructurer';
export type OutputFormat = 'Flyer / Poster' | 'Brochure' | 'Social Media Post' | 'Article / Blog Post';

export interface Color {
  name: string;
  hex: string;
}

export interface VisualElements {
  iconStyle: string;
  background: string;
  imageSuggestions: string[];
}

export interface DesignIdea {
  concept: string;
  titleSuggestions: string[];
  suggestedContent: string;
  ctas: string[];
  visuals: VisualElements;
  colorPalette: Color[];
  modeSpecificContent: string;
}

export interface AiResponse {
  toolName: string;
  designIdea: DesignIdea;
}

// Structured Content Types
export interface StructuredContentBase {
  [key: string]: any;
}

export interface FlyerPosterContent extends StructuredContentBase {
  headlines: string[];
  body: string;
  keyFeatures: string[];
  ctas: string[];
}

export interface BrochurePanel {
  title: string;
  content: string;
}

export interface BrochureContent extends StructuredContentBase {
  frontPanel: {
    headline: string;
    tagline: string;
  };
  innerPanels: BrochurePanel[];
  backPanel: {
    cta: string;
    contactInfo: string;
  };
}

export interface SocialMediaPostContent extends StructuredContentBase {
  hook: string;
  body: string;
  hashtags: string[];
  cta: string;
}

export interface ArticleSection {
  title: string;
  content: string;
}

export interface ArticleContent extends StructuredContentBase {
  titleSuggestions: string[];
  introduction: string;
  sections: ArticleSection[];
  conclusion: string;
}

export type StructuredContent = FlyerPosterContent | BrochureContent | SocialMediaPostContent | ArticleContent;

// Search Result Types for Real-time Info
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: GroundingChunkWeb;
}

export interface SearchResult {
  summary: string;
  sources: GroundingChunk[];
}

// History Types
export type HistoryPrompt = {
  toolMode: 'ideaGenerator';
  context: string;
  caption: string;
  mode: DesignMode;
  logo: string | null;
  brandColor: string;
} | {
  toolMode: 'contentStructurer';
  rawContent: string;
  outputFormat: OutputFormat;
  logo: string | null;
  brandColor: string;
};

export interface HistoryResult {
  designIdea?: DesignIdea | null;
  structuredContent?: StructuredContent | null;
}

export interface HistoryItem {
  id: number; // Using timestamp
  date: string;
  prompt: HistoryPrompt;
  result: HistoryResult;
}
