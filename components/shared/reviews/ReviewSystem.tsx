'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Star, StarHalf, ThumbsUp, Flag, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  helpful: number;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  response?: {
    content: string;
    createdAt: string;
    author: {
      name: string;
      role: string;
    };
  };
}

interface ReviewSystemProps {
  targetId: string;
  targetType: 'property' | 'service' | 'leisure' | 'profile';
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export function ReviewSystem({
  targetId,
  targetType,
  averageRating,
  totalReviews,
  ratingDistribution,
}: ReviewSystemProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchReviews();
  }, [targetId, sortBy, filterBy]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        \`/api/reviews?targetId=\${targetId}&targetType=\${targetType}&sort=\${sortBy}&filter=\${filterBy}\`
      );
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId,
          targetType,
          ...newReview,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Review submitted',
          description: 'Thank you for your feedback!',
        });
        setIsWriteReviewOpen(false);
        setNewReview({ rating: 5, title: '', content: '' });
        fetchReviews();
      }
    } catch (error) {
      toast({
        title: 'Error submitting review',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(\`/api/reviews/\${reviewId}/helpful\`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const handleReport = async (reviewId: string) => {
    try {
      const response = await fetch(\`/api/reviews/\${reviewId}/report\`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Review reported',
          description: 'Thank you for helping maintain our community standards.',
        });
      }
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reviews</h2>
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= averageRating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-lg font-semibold">
              {averageRating.toFixed(1)}
            </span>
            <span className="ml-2 text-gray-600">
              ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        <Dialog open={isWriteReviewOpen} onOpenChange={setIsWriteReviewOpen}>
          <DialogTrigger asChild>
            <Button>Write a Review</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your experience to help others make better decisions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="flex items-center space-x-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="icon"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= newReview.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newReview.title}
                  onChange={(e) =>
                    setNewReview({ ...newReview, title: e.target.value })
                  }
                  placeholder="Summarize your experience"
                />
              </div>
              <div>
                <Label htmlFor="content">Review</Label>
                <Textarea
                  id="content"
                  value={newReview.content}
                  onChange={(e) =>
                    setNewReview({ ...newReview, content: e.target.value })
                  }
                  placeholder="Share the details of your experience"
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsWriteReviewOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReview}>Submit Review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rating Distribution */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {Object.entries(ratingDistribution)
            .reverse()
            .map(([rating, count]) => (
              <div key={rating} className="flex items-center">
                <span className="w-12 text-sm">{rating} stars</span>
                <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{
                      width: \`\${(count / totalReviews) * 100}%\`,
                    }}
                  />
                </div>
                <span className="w-12 text-sm text-right">{count}</span>
              </div>
            ))}
        </div>
        <div className="space-y-4">
          <div>
            <Label>Sort by</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
                <SelectItem value="rating-high">Highest Rated</SelectItem>
                <SelectItem value="rating-low">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Filter by</Label>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
                <SelectItem value="with-response">With Response</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={review.author.image} />
                    <AvatarFallback>
                      {review.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{review.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center space-x-2">
                        <span>{review.author.name}</span>
                        <span>•</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(review.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleReport(review.id)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{review.content}</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHelpful(review.id)}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Helpful ({review.helpful})
              </Button>
            </CardFooter>

            {/* Owner Response */}
            {review.response && (
              <CardContent className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div>
                    <p className="font-semibold">
                      Response from {review.response.author.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {review.response.author.role}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(
                        new Date(review.response.createdAt),
                        { addSuffix: true }
                      )}
                    </p>
                    <p className="mt-2">{review.response.content}</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}