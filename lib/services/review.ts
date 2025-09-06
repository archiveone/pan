import {
  Review,
  ReviewStats,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewFilters,
  ReviewResponse,
} from '../types/review';

class ReviewService {
  private readonly API_BASE_URL = '/api/reviews';

  // Create a new review
  async createReview(request: CreateReviewRequest): Promise<Review> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Update an existing review
  async updateReview(
    reviewId: string,
    request: UpdateReviewRequest
  ): Promise<Review> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Get reviews for an item
  async getItemReviews(
    itemId: string,
    itemType: string,
    filters?: ReviewFilters
  ): Promise<{ reviews: Review[]; stats: ReviewStats }> {
    try {
      const queryParams = new URLSearchParams({
        itemId,
        itemType,
        ...(filters || {}),
      });

      const response = await fetch(
        `${this.API_BASE_URL}/item?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get item reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting item reviews:', error);
      throw error;
    }
  }

  // Get reviews by a user
  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get user reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user reviews:', error);
      throw error;
    }
  }

  // Add a response to a review
  async addReviewResponse(
    reviewId: string,
    response: ReviewResponse
  ): Promise<Review> {
    try {
      const apiResponse = await fetch(
        `${this.API_BASE_URL}/${reviewId}/response`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(response),
        }
      );

      if (!apiResponse.ok) {
        const error = await apiResponse.json();
        throw new Error(error.message || 'Failed to add review response');
      }

      return await apiResponse.json();
    } catch (error) {
      console.error('Error adding review response:', error);
      throw error;
    }
  }

  // Mark a review as helpful
  async markReviewHelpful(reviewId: string): Promise<Review> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/${reviewId}/helpful`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark review as helpful');
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
    }
  }

  // Get review statistics for an item
  async getItemReviewStats(
    itemId: string,
    itemType: string
  ): Promise<ReviewStats> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/stats/${itemType}/${itemId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get review statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting review statistics:', error);
      throw error;
    }
  }

  // Check if a user can review an item (has completed booking)
  async canUserReview(itemId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/can-review?itemId=${itemId}&userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check review eligibility');
      }

      const { canReview } = await response.json();
      return canReview;
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      throw error;
    }
  }
}

export const reviewService = new ReviewService();