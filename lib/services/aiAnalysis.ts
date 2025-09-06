import { OpenAI } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { 
  AIAnalysisResult, 
  ContentCluster, 
  SentimentAnalysis,
  ToxicityAnalysis,
  AuthenticityAnalysis,
  ContentQualityAnalysis,
} from '@/lib/types/aiAnalysis';

const openai = new OpenAI();

export class AIAnalysisService {
  /**
   * Analyze review content using multiple AI models and techniques
   */
  async analyzeReview(params: {
    reviewId: string;
    title: string;
    content: string;
    authorId: string;
    itemType: string;
    itemId: string;
  }): Promise<AIAnalysisResult> {
    const { reviewId, title, content, authorId, itemType, itemId } = params;

    // Run analyses in parallel for better performance
    const [
      sentimentAnalysis,
      toxicityAnalysis,
      authenticityAnalysis,
      qualityAnalysis,
      contentClusters,
    ] = await Promise.all([
      this.analyzeSentiment({ title, content }),
      this.analyzeToxicity({ title, content }),
      this.analyzeAuthenticity({ 
        content, 
        authorId, 
        itemType, 
        itemId 
      }),
      this.analyzeContentQuality({ title, content }),
      this.clusterContent({ content }),
    ]);

    // Combine all analyses
    const result: AIAnalysisResult = {
      reviewId,
      sentiment: sentimentAnalysis,
      toxicity: toxicityAnalysis,
      authenticity: authenticityAnalysis,
      quality: qualityAnalysis,
      clusters: contentClusters,
      timestamp: new Date().toISOString(),
    };

    // Store analysis result
    await this.storeAnalysisResult(result);

    return result;
  }

  /**
   * Analyze sentiment using advanced NLP
   */
  private async analyzeSentiment({
    title,
    content,
  }: {
    title: string;
    content: string;
  }): Promise<SentimentAnalysis> {
    const response = await openai.analyze({
      model: 'gpt-4',
      task: 'sentiment',
      content: `${title}\n${content}`,
    });

    return {
      score: response.sentiment_score, // -1 to 1
      label: response.sentiment_label, // positive, negative, neutral
      confidence: response.confidence,
      aspects: response.aspect_sentiments, // Sentiment per aspect/topic
    };
  }

  /**
   * Analyze content toxicity and inappropriate content
   */
  private async analyzeToxicity({
    title,
    content,
  }: {
    title: string;
    content: string;
  }): Promise<ToxicityAnalysis> {
    const response = await openai.analyze({
      model: 'content-filter',
      task: 'toxicity',
      content: `${title}\n${content}`,
    });

    return {
      score: response.toxicity_score, // 0 to 1
      categories: {
        hate: response.hate_score,
        harassment: response.harassment_score,
        profanity: response.profanity_score,
        violence: response.violence_score,
        sexual: response.sexual_score,
      },
      flags: response.content_flags,
      confidence: response.confidence,
    };
  }

  /**
   * Analyze review authenticity and detect potential fake reviews
   */
  private async analyzeAuthenticity({
    content,
    authorId,
    itemType,
    itemId,
  }: {
    content: string;
    authorId: string;
    itemType: string;
    itemId: string;
  }): Promise<AuthenticityAnalysis> {
    // Get author's review history
    const authorHistory = await prisma.review.findMany({
      where: {
        userId: authorId,
        NOT: {
          itemId, // Exclude current item
        },
      },
      select: {
        content: true,
        createdAt: true,
      },
    });

    // Get similar reviews for the same item
    const similarReviews = await prisma.review.findMany({
      where: {
        itemId,
        NOT: {
          userId: authorId, // Exclude current author
        },
      },
      select: {
        content: true,
        createdAt: true,
      },
    });

    const response = await openai.analyze({
      model: 'gpt-4',
      task: 'authenticity',
      content,
      context: {
        authorHistory,
        similarReviews,
      },
    });

    return {
      authenticityScore: response.authenticity_score, // 0 to 1
      spamProbability: response.spam_probability,
      fakeProbability: response.fake_probability,
      botProbability: response.bot_probability,
      patterns: {
        duplicateContent: response.duplicate_patterns,
        suspiciousPatterns: response.suspicious_patterns,
        botPatterns: response.bot_patterns,
      },
      confidence: response.confidence,
    };
  }

  /**
   * Analyze content quality and helpfulness
   */
  private async analyzeContentQuality({
    title,
    content,
  }: {
    title: string;
    content: string;
  }): Promise<ContentQualityAnalysis> {
    const response = await openai.analyze({
      model: 'gpt-4',
      task: 'quality',
      content: `${title}\n${content}`,
    });

    return {
      overallScore: response.quality_score, // 0 to 1
      metrics: {
        relevance: response.relevance_score,
        clarity: response.clarity_score,
        detail: response.detail_score,
        helpfulness: response.helpfulness_score,
        objectivity: response.objectivity_score,
      },
      suggestions: response.improvement_suggestions,
      confidence: response.confidence,
    };
  }

  /**
   * Cluster review content into topics/themes
   */
  private async clusterContent({
    content,
  }: {
    content: string;
  }): Promise<ContentCluster[]> {
    const response = await openai.analyze({
      model: 'gpt-4',
      task: 'clustering',
      content,
    });

    return response.clusters.map((cluster: any) => ({
      topic: cluster.topic,
      keywords: cluster.keywords,
      sentiment: cluster.sentiment,
      confidence: cluster.confidence,
      relevance: cluster.relevance_score,
    }));
  }

  /**
   * Store analysis result in database
   */
  private async storeAnalysisResult(result: AIAnalysisResult): Promise<void> {
    await prisma.reviewAIAnalysis.create({
      data: {
        reviewId: result.reviewId,
        sentiment: result.sentiment,
        toxicity: result.toxicity,
        authenticity: result.authenticity,
        quality: result.quality,
        clusters: result.clusters,
        timestamp: result.timestamp,
      },
    });

    // If review needs immediate action based on analysis
    if (
      result.toxicity.score > 0.8 ||
      result.authenticity.fakeProbability > 0.8 ||
      result.authenticity.spamProbability > 0.8
    ) {
      await prisma.review.update({
        where: { id: result.reviewId },
        data: {
          status: 'flagged',
          flaggedAt: new Date().toISOString(),
          flagReason: 'ai_detection',
        },
      });

      // Notify moderators
      const moderators = await prisma.moderator.findMany({
        select: { userId: true },
      });

      await prisma.notification.createMany({
        data: moderators.map((mod) => ({
          userId: mod.userId,
          type: 'AI_FLAGGED_REVIEW',
          title: 'Review Flagged by AI',
          message: 'A review has been automatically flagged by AI analysis.',
          data: {
            reviewId: result.reviewId,
            aiAnalysis: {
              toxicity: result.toxicity.score,
              fake: result.authenticity.fakeProbability,
              spam: result.authenticity.spamProbability,
            },
          },
        })),
      });
    }
  }
}