export type SentimentLabel = 'positive' | 'negative' | 'neutral';

export interface AspectSentiment {
  aspect: string;
  sentiment: SentimentLabel;
  score: number;
  confidence: number;
}

export interface SentimentAnalysis {
  score: number; // -1 to 1
  label: SentimentLabel;
  confidence: number;
  aspects: AspectSentiment[];
}

export interface ToxicityCategories {
  hate: number;
  harassment: number;
  profanity: number;
  violence: number;
  sexual: number;
}

export interface ContentFlags {
  hate_speech: boolean;
  harassment: boolean;
  profanity: boolean;
  violence: boolean;
  sexual_content: boolean;
  spam: boolean;
  misleading: boolean;
}

export interface ToxicityAnalysis {
  score: number; // 0 to 1
  categories: ToxicityCategories;
  flags: ContentFlags;
  confidence: number;
}

export interface ContentPatterns {
  duplicateContent: {
    found: boolean;
    similarity: number;
    matches: string[];
  };
  suspiciousPatterns: {
    found: boolean;
    patterns: string[];
    confidence: number;
  };
  botPatterns: {
    found: boolean;
    patterns: string[];
    confidence: number;
  };
}

export interface AuthenticityAnalysis {
  authenticityScore: number; // 0 to 1
  spamProbability: number;
  fakeProbability: number;
  botProbability: number;
  patterns: ContentPatterns;
  confidence: number;
}

export interface QualityMetrics {
  relevance: number;
  clarity: number;
  detail: number;
  helpfulness: number;
  objectivity: number;
}

export interface ImprovementSuggestion {
  aspect: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ContentQualityAnalysis {
  overallScore: number; // 0 to 1
  metrics: QualityMetrics;
  suggestions: ImprovementSuggestion[];
  confidence: number;
}

export interface ContentCluster {
  topic: string;
  keywords: string[];
  sentiment: SentimentLabel;
  confidence: number;
  relevance: number;
}

export interface AIAnalysisResult {
  reviewId: string;
  sentiment: SentimentAnalysis;
  toxicity: ToxicityAnalysis;
  authenticity: AuthenticityAnalysis;
  quality: ContentQualityAnalysis;
  clusters: ContentCluster[];
  timestamp: string;
}

// Database schema types
export interface ReviewAIAnalysisCreate {
  reviewId: string;
  sentiment: SentimentAnalysis;
  toxicity: ToxicityAnalysis;
  authenticity: AuthenticityAnalysis;
  quality: ContentQualityAnalysis;
  clusters: ContentCluster[];
  timestamp: string;
}

export interface ReviewAIAnalysisUpdate {
  sentiment?: SentimentAnalysis;
  toxicity?: ToxicityAnalysis;
  authenticity?: AuthenticityAnalysis;
  quality?: ContentQualityAnalysis;
  clusters?: ContentCluster[];
  timestamp?: string;
}

// AI Analysis Configuration
export interface AIAnalysisConfig {
  models: {
    sentiment: string;
    toxicity: string;
    authenticity: string;
    quality: string;
    clustering: string;
  };
  thresholds: {
    toxicity: number;
    spam: number;
    fake: number;
    bot: number;
    quality: number;
  };
  options: {
    parallelAnalysis: boolean;
    storeResults: boolean;
    notifyModerators: boolean;
    autoFlag: boolean;
  };
}

// AI Analysis Stats
export interface AIAnalysisStats {
  totalAnalyzed: number;
  flaggedByAI: number;
  averageScores: {
    sentiment: number;
    toxicity: number;
    authenticity: number;
    quality: number;
  };
  commonClusters: {
    topic: string;
    count: number;
  }[];
  flagDistribution: {
    hate: number;
    harassment: number;
    spam: number;
    fake: number;
    other: number;
  };
  accuracy: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
}