"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  ChartBarIcon,
  FlagIcon,
  ShieldCheckIcon,
  CogIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { reviewModerationService } from '@/lib/services/reviewModeration';
import { ReviewModerationFilters } from '@/lib/types/reviewModeration';

export default function ModerationDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReviewModerationFilters>({
    status: 'pending',
    page: 1,
    limit: 10,
  });
  const [reviews, setReviews] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);

  // Check authentication and authorization
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      loadDashboardData();
    }
  }, [status, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, reviewsData, rulesData] = await Promise.all([
        reviewModerationService.getModerationStats(),
        reviewModerationService.getPendingReviews(filters),
        reviewModerationService.getRules(),
      ]);

      setStats(statsData);
      setReviews(reviewsData.reviews);
      setRules(rulesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<ReviewModerationFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedReviews.length === 0) {
      toast.error('Please select reviews to moderate');
      return;
    }

    try {
      setLoading(true);
      const result = await reviewModerationService.bulkModerateReviews({
        reviews: selectedReviews.map((id) => ({
          reviewId: id,
          action,
          reason: action === 'reject' ? 'Bulk rejection' : undefined,
        })),
      });

      toast.success(
        `Successfully processed ${result.summary.succeeded} reviews`
      );
      
      if (result.summary.failed > 0) {
        toast.error(`Failed to process ${result.summary.failed} reviews`);
      }

      loadDashboardData();
      setSelectedReviews([]);
    } catch (error) {
      console.error('Error in bulk moderation:', error);
      toast.error('Failed to process reviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Review Moderation Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting moderation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Flagged Reviews
            </CardTitle>
            <FlagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.flagged || 0}</div>
            <p className="text-xs text-muted-foreground">
              Reported by users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Rules
            </CardTitle>
            <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.filter((r) => r.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-moderation rules
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Moderated
            </CardTitle>
            <CogIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.approved || 0) + (stats?.rejected || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Reviews processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Reviews</TabsTrigger>
          <TabsTrigger value="rules">Auto-Moderation Rules</TabsTrigger>
          <TabsTrigger value="logs">Moderation Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-4">
            <Select
              value={filters.itemType}
              onValueChange={(value) =>
                handleFilterChange({ itemType: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="property">Properties</SelectItem>
                <SelectItem value="service">Services</SelectItem>
                <SelectItem value="leisure">Leisure</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search reviews..."
              className="max-w-sm"
              onChange={(e) =>
                handleFilterChange({ search: e.target.value })
              }
            />

            <div className="ml-auto space-x-2">
              <Button
                variant="outline"
                onClick={() => handleBulkAction('reject')}
                disabled={selectedReviews.length === 0}
              >
                Reject Selected
              </Button>
              <Button
                onClick={() => handleBulkAction('approve')}
                disabled={selectedReviews.length === 0}
              >
                Approve Selected
              </Button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="flex flex-row items-start gap-4">
                  <Checkbox
                    checked={selectedReviews.includes(review.id)}
                    onCheckedChange={(checked) => {
                      setSelectedReviews((prev) =>
                        checked
                          ? [...prev, review.id]
                          : prev.filter((id) => id !== review.id)
                      );
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {review.title}
                      </CardTitle>
                      <Badge>{review.itemType}</Badge>
                    </div>
                    <CardDescription>
                      By {review.user.name} • {new Date(review.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{review.content}</p>
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2 mt-4">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flagged">
          {/* Flagged Reviews Content */}
        </TabsContent>

        <TabsContent value="rules">
          {/* Auto-Moderation Rules Content */}
        </TabsContent>

        <TabsContent value="logs">
          {/* Moderation Logs Content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}