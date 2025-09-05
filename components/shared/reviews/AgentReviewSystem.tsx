'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Star,
  ThumbsUp,
  Flag,
  MoreVertical,
  Clock,
  MessageSquare,
  Briefcase,
  Award,
} from 'lucide-react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface AgentReview {
  id: string;
  ratings: {
    overall: number;
    communication: number;
    expertise: number;
    negotiation: number;
    responsiveness: number;
    professionalism: number;
  };
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  helpful: number;
  transactionType: 'buy' | 'sell' | 'rent' | 'let';
  propertyType: string;
  transactionDate: string;
  author: {
    id: string;
    name: string;
    image?: string;
    location?: string;
  };
  response?: {
    content: string;
    createdAt: string;
    author: {
      name: string;
      role: string;
    };
  };
  verified: boolean;
}

interface AgentReviewSystemProps {
  agentId: string;
  agentName: string;
  agentImage?: string;
  stats: {
    totalTransactions: number;
    yearsOfExperience: number;
    responseRate: number;
    responseTime: string;
    ratings: {
      overall: number;
      communication: number;
      expertise: number;
      negotiation: number;
      responsiveness: number;
      professionalism: number;
    };
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    totalReviews: number;
    verifiedReviews: number;
  };
}

export function AgentReviewSystem({
  agentId,
  agentName,
  agentImage,
  stats,
}: AgentReviewSystemProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [newReview, setNewReview] = useState({
    ratings: {
      overall: 5,
      communication: 5,
      expertise: 5,
      negotiation: 5,
      responsiveness: 5,
      professionalism: 5,
    },
    title: '',
    content: '',
    transactionType: 'buy',
    propertyType: '',
    transactionDate: '',
  });

  useEffect(() => {
    fetchReviews();
  }, [agentId, sortBy, filterBy]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        \`/api/agents/\${agentId}/reviews?sort=\${sortBy}&filter=\${filterBy}\`
      );
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    try {
      const response = await fetch(\`/api/agents/\${agentId}/reviews\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview),
      });

      if (response.ok) {
        toast({
          title: 'Review submitted',
          description: 'Thank you for sharing your experience!',
        });
        setIsWriteReviewOpen(false);
        setNewReview({
          ratings: {
            overall: 5,
            communication: 5,
            expertise: 5,
            negotiation: 5,
            responsiveness: 5,
            professionalism: 5,
          },
          title: '',
          content: '',
          transactionType: 'buy',
          propertyType: '',
          transactionDate: '',
        });
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

  return (
    <div className="space-y-8">
      {/* Agent Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{stats.yearsOfExperience}+</p>
                <p className="text-sm text-gray-500">Years in Real Estate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                <p className="text-sm text-gray-500">Completed Deals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{stats.responseRate}%</p>
                <p className="text-sm text-gray-500">Response Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{stats.responseTime}</p>
                <p className="text-sm text-gray-500">Average Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Ratings</CardTitle>
          <CardDescription>
            Average ratings across key performance areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(stats.ratings).map(([category, rating]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: \`\${(rating / 5) * 100}%\` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Client Reviews</h2>
            <p className="text-gray-600">
              {stats.totalReviews} reviews ({stats.verifiedReviews} verified)
            </p>
          </div>

          <Dialog open={isWriteReviewOpen} onOpenChange={setIsWriteReviewOpen}>
            <DialogTrigger asChild>
              <Button>Write a Review</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Review {agentName}</DialogTitle>
                <DialogDescription>
                  Share your experience working with this agent
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="ratings">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ratings">Ratings</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                <TabsContent value="ratings" className="space-y-4">
                  {Object.entries(newReview.ratings).map(([category, rating]) => (
                    <div key={category}>
                      <Label className="capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <div className="flex items-center space-x-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Button
                            key={star}
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setNewReview({
                                ...newReview,
                                ratings: {
                                  ...newReview.ratings,
                                  [category]: star,
                                },
                              })
                            }
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="details" className="space-y-4">
                  <div>
                    <Label>Transaction Type</Label>
                    <Select
                      value={newReview.transactionType}
                      onValueChange={(value: any) =>
                        setNewReview({ ...newReview, transactionType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buying</SelectItem>
                        <SelectItem value="sell">Selling</SelectItem>
                        <SelectItem value="rent">Renting</SelectItem>
                        <SelectItem value="let">Letting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Property Type</Label>
                    <Input
                      value={newReview.propertyType}
                      onChange={(e) =>
                        setNewReview({
                          ...newReview,
                          propertyType: e.target.value,
                        })
                      }
                      placeholder="e.g., Apartment, House, etc."
                    />
                  </div>
                  <div>
                    <Label>Transaction Date</Label>
                    <Input
                      type="date"
                      value={newReview.transactionDate}
                      onChange={(e) =>
                        setNewReview({
                          ...newReview,
                          transactionDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Review Title</Label>
                    <Input
                      value={newReview.title}
                      onChange={(e) =>
                        setNewReview({ ...newReview, title: e.target.value })
                      }
                      placeholder="Summarize your experience"
                    />
                  </div>
                  <div>
                    <Label>Review Details</Label>
                    <Textarea
                      value={newReview.content}
                      onChange={(e) =>
                        setNewReview({ ...newReview, content: e.target.value })
                      }
                      placeholder="Share your experience working with this agent"
                      rows={5}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsWriteReviewOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitReview}>Submit Review</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Review Filters */}
        <div className="flex items-center space-x-4">
          <div className="w-48">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
                <SelectItem value="rating-high">Highest Rated</SelectItem>
                <SelectItem value="rating-low">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="buy">Buyers</SelectItem>
                <SelectItem value="sell">Sellers</SelectItem>
                <SelectItem value="rent">Renters</SelectItem>
                <SelectItem value="let">Landlords</SelectItem>
              </SelectContent>
            </Select>
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
                          {review.author.location && (
                            <>
                              <span>•</span>
                              <span>{review.author.location}</span>
                            </>
                          )}
                          <span>•</span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.ratings.overall
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          {review.verified && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 font-medium">
                                Verified Transaction
                              </span>
                            </>
                          )}
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="capitalize">
                            {review.transactionType}ing
                          </span>{' '}
                          a {review.propertyType} •{' '}
                          {formatDistanceToNow(
                            new Date(review.transactionDate),
                            { addSuffix: true }
                          )}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{review.content}</p>

                {/* Detailed Ratings */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(review.ratings)
                    .filter(([key]) => key !== 'overall')
                    .map(([category, rating]) => (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-sm font-medium">
                            {rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: \`\${(rating / 5) * 100}%\` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Helpful ({review.helpful})
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </CardFooter>

              {/* Agent Response */}
              {review.response && (
                <CardContent className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={agentImage} />
                      <AvatarFallback>{agentName.charAt(0)}</AvatarFallback>
                    </Avatar>
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
    </div>
  );
}