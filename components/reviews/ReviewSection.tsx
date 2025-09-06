"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { format } from 'date-fns';
import { reviewService } from '@/lib/services/review';
import { Review, ReviewStats, ReviewFilters } from '@/lib/types/review';
import {
  StarIcon,
  PhotoIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'sonner';

interface ReviewSectionProps {
  itemId: string;
  itemType: string;
  canUserReview?: boolean;
}

export default function ReviewSection({
  itemId,
  itemType,
  canUserReview = false,
}: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReviewFilters>({
    sortBy: 'recent',
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [itemId, itemType, filters]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getItemReviews(
        itemId,
        itemType,
        filters
      );
      setReviews(response.reviews);
      setStats(response.stats);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<ReviewFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!session) {
      toast.error('Please sign in to mark reviews as helpful');
      return;
    }

    try {
      await reviewService.markReviewHelpful(reviewId);
      loadReviews(); // Reload to get updated helpful count
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      toast.error('Failed to mark review as helpful');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <StarIconSolid className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  const renderRatingBar = (rating: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2">
        <span className="w-12 text-sm text-gray-600">{rating} stars</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-yellow-400 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-12 text-sm text-gray-600">{count}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Reviews {stats && `(${stats.totalReviews})`}
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center"
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filter Reviews
        </button>
      </div>

      {/* Rating Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </div>
              <div>
                {renderStars(Math.round(stats.averageRating))}
                <p className="text-sm text-gray-600">
                  {stats.totalReviews} total reviews
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating}>
                  {renderRatingBar(
                    rating,
                    stats.ratingDistribution[rating],
                    stats.totalReviews
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="card p-4 space-y-4">
              <h3 className="font-medium text-gray-900">Filter & Sort</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sort by
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange({
                        sortBy: e.target.value as ReviewFilters['sortBy'],
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="rating">Highest Rated</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rating
                  </label>
                  <select
                    value={filters.rating || ''}
                    onChange={(e) =>
                      handleFilterChange({
                        rating: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">All Ratings</option>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} Stars
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasPhotos}
                      onChange={(e) =>
                        handleFilterChange({ hasPhotos: e.target.checked })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      With Photos
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasResponse}
                      onChange={(e) =>
                        handleFilterChange({ hasResponse: e.target.checked })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      With Responses
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          <p className="mt-2 text-gray-600">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews yet</h3>
          <p className="mt-1 text-gray-600">Be the first to review this item</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="card p-6">
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={review.user.image || '/default-avatar.png'}
                      alt={review.user.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {review.user.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(review.createdAt), 'PPP')}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {/* Review Title & Content */}
                <div>
                  <h4 className="font-medium text-gray-900">{review.title}</h4>
                  <p className="mt-2 text-gray-600">{review.content}</p>
                </div>

                {/* Review Photos */}
                {review.photos && review.photos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {review.photos.map((photo, index) => (
                      <Image
                        key={index}
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        width={120}
                        height={120}
                        className="rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <button
                    onClick={() => handleMarkHelpful(review.id)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    <HandThumbUpIcon className="h-5 w-5 mr-1" />
                    Helpful ({review.helpful})
                  </button>
                  {review.response && (
                    <div className="flex-1 ml-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">
                        Response from {review.response.authorName}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {review.response.content}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {format(new Date(review.response.createdAt), 'PPP')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}