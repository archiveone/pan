"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FlagIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { reviewModerationService } from '@/lib/services/reviewModeration';
import { ReviewFlagReason } from '@/lib/types/reviewModeration';

export default function FlaggedReviews() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    flagReason: '' as ReviewFlagReason | '',
    page: 1,
    limit: 10,
  } as any);

  useEffect(() => {
    loadFlaggedReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadFlaggedReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewModerationService.getPendingReviews({
        ...filters,
        status: 'flagged',
      });
      setReviews(response.reviews);
    } catch (error) {
      console.error('Error loading flagged reviews:', error);
      toast.error('Failed to load flagged reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveFlag = async (
    flagId: string,
    action: 'approved' | 'rejected' | 'removed'
  ) => {
    try {
      setLoading(true);
      await reviewModerationService.resolveFlaggedReview(flagId, {
        action,
        note: `Resolved as ${action} by moderator`,
      });
      toast.success('Flag resolved successfully');
      loadFlaggedReviews();
    } catch (error) {
      console.error('Error resolving flag:', error);
      toast.error('Failed to resolve flag');
    } finally {
      setLoading(false);
    }
  };

  const getFlagReasonLabel = (reason: ReviewFlagReason) => {
    const labels: Record<ReviewFlagReason, string> = {
      inappropriate: 'Inappropriate Content',
      spam: 'Spam',
      offensive: 'Offensive Content',
      fake: 'Fake Review',
      conflict_of_interest: 'Conflict of Interest',
      other: 'Other',
    } as const;
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={filters.flagReason}
          onValueChange={(value) =>
            setFilters((prev: any) => ({ ...prev, flagReason: value as ReviewFlagReason, page: 1 }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Flag Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Flag Types</SelectItem>
            <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
            <SelectItem value="offensive">Offensive Content</SelectItem>
            <SelectItem value="fake">Fake Review</SelectItem>
            <SelectItem value="conflict_of_interest">Conflict of Interest</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search flagged reviews..."
          className="max-w-sm"
          onChange={(e) =>
            setFilters((prev: any) => ({ ...prev, search: e.target.value, page: 1 }))
          }
        />
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <FlagIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No flagged reviews
            </h3>
            <p className="mt-1 text-gray-600">
              There are no reviews that have been flagged by users
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{review.title}</CardTitle>
                    <CardDescription>
                      By {review.user.name} •{' '}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="destructive">
                    {review.flags.length} Flag{review.flags.length !== 1 && 's'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">{review.content}</p>

                  {/* Flag Details */}
                  <div className="bg-red-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-red-800">Flag Details</h4>
                    {review.flags.map((flag: any) => (
                      <div
                        key={flag.id}
                        className="flex items-start justify-between border-t border-red-200 pt-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            {getFlagReasonLabel(flag.reason)}
                          </p>
                          {flag.details && (
                            <p className="text-sm text-red-700 mt-1">
                              {flag.details}
                            </p>
                          )}
                          <p className="text-xs text-red-600 mt-1">
                            Reported by {flag.user.name} •{' '}
                            {new Date(flag.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveFlag(flag.id, 'rejected')}
                          >
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleResolveFlag(flag.id, 'removed')}
                          >
                            Remove Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Review Photos */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2">
                      {review.photos.map((photo: string, index: number) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Review photo ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}