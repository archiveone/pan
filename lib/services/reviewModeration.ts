import {
  ReviewStatus,
  ReviewFlag,
  ReviewFlagReason,
  ReviewModerationRequest,
  ReviewModerationFilters,
  ReviewModerationStats,
  ReviewModerationLog,
  AutoModerationRule,
  ReviewAIAnalysis,
} from '../types/reviewModeration';
import { Review } from '../types/review';

class ReviewModerationService {
  private readonly API_BASE_URL = '/api/reviews/moderation';

  // Get reviews pending moderation
  async getPendingReviews(filters?: ReviewModerationFilters): Promise<{
    reviews: Review[];
    total: number;
  }> {
    try {
      const queryParams = new URLSearchParams({
        ...(filters || {}),
        status: 'pending',
      });

      const response = await fetch(
        `${this.API_BASE_URL}/reviews?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get pending reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting pending reviews:', error);
      throw error;
    }
  }

  // Moderate a review
  async moderateReview(request: ReviewModerationRequest): Promise<Review> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to moderate review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error moderating review:', error);
      throw error;
    }
  }

  // Flag a review
  async flagReview(
    reviewId: string,
    reason: ReviewFlagReason,
    details?: string
  ): Promise<ReviewFlag> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId, reason, details }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to flag review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error flagging review:', error);
      throw error;
    }
  }

  // Get moderation statistics
  async getModerationStats(): Promise<ReviewModerationStats> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get moderation stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting moderation stats:', error);
      throw error;
    }
  }

  // Get moderation logs
  async getModerationLogs(reviewId: string): Promise<ReviewModerationLog[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/logs/${reviewId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get moderation logs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting moderation logs:', error);
      throw error;
    }
  }

  // Create auto-moderation rule
  async createAutoModerationRule(rule: Omit<AutoModerationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AutoModerationRule> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create auto-moderation rule');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating auto-moderation rule:', error);
      throw error;
    }
  }

  // Update auto-moderation rule
  async updateAutoModerationRule(
    ruleId: string,
    updates: Partial<AutoModerationRule>
  ): Promise<AutoModerationRule> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/rules/${ruleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update auto-moderation rule');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating auto-moderation rule:', error);
      throw error;
    }
  }

  // Delete auto-moderation rule
  async deleteAutoModerationRule(ruleId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/rules/${ruleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete auto-moderation rule');
      }
    } catch (error) {
      console.error('Error deleting auto-moderation rule:', error);
      throw error;
    }
  }

  // Get AI analysis for a review
  async getAIAnalysis(reviewId: string): Promise<ReviewAIAnalysis> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/ai-analysis/${reviewId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get AI analysis');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      throw error;
    }
  }

  // Resolve a flagged review
  async resolveFlaggedReview(
    flagId: string,
    resolution: {
      action: 'approved' | 'rejected' | 'removed';
      note: string;
    }
  ): Promise<ReviewFlag> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/flags/${flagId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resolution),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to resolve flagged review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error resolving flagged review:', error);
      throw error;
    }
  }
}

export const reviewModerationService = new ReviewModerationService();