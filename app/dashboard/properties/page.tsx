"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/format';
import { PropertyMap } from '@/components/properties/PropertyMap';
import { PropertyType, ListingType } from '@prisma/client';
import {
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  MessageSquareIcon,
  HeartIcon,
} from 'lucide-react';

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalEnquiries: number;
  totalFavorites: number;
  recentActivity: Array<{
    id: string;
    type: 'view' | 'enquiry' | 'favorite' | 'offer';
    propertyId: string;
    propertyTitle: string;
    timestamp: string;
    user?: {
      name: string;
      image?: string;
    };
  }>;
  performanceMetrics: {
    viewsThisMonth: number;
    viewsLastMonth: number;
    enquiriesThisMonth: number;
    enquiriesLastMonth: number;
    favoritesThisMonth: number;
    favoritesLastMonth: number;
  };
  listingsByType: Array<{
    type: string;
    count: number;
  }>;
  listingsByStatus: Array<{
    status: string;
    count: number;
  }>;
  recentListings: Array<{
    id: string;
    title: string;
    type: PropertyType;
    listingType: ListingType;
    price: number;
    currency: string;
    status: string;
    createdAt: string;
    views: number;
    enquiries: number;
    favorites: number;
  }>;
}

export default function PropertyDashboard() {
  const { data: session } = useSession();
  const [timeframe, setTimeframe] = useState('7D');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/properties/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  if (!stats) return null;

  const {
    totalListings,
    activeListings,
    totalViews,
    totalEnquiries,
    totalFavorites,
    performanceMetrics,
    recentActivity,
    recentListings,
  } = stats;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Property Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select
            value={timeframe}
            onValueChange={setTimeframe}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7D">7 Days</SelectItem>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="3M">3 Months</SelectItem>
              <SelectItem value="1Y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalListings}</div>
            <p className="text-xs text-muted-foreground">
              {activeListings} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Views
            </CardTitle>
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              {performanceMetrics.viewsThisMonth > performanceMetrics.viewsLastMonth ? (
                <span className="text-green-500">
                  <ArrowUpIcon className="mr-1 inline h-3 w-3" />
                  {((performanceMetrics.viewsThisMonth - performanceMetrics.viewsLastMonth) / performanceMetrics.viewsLastMonth * 100).toFixed(1)}%
                </span>
              ) : (
                <span className="text-red-500">
                  <ArrowDownIcon className="mr-1 inline h-3 w-3" />
                  {((performanceMetrics.viewsLastMonth - performanceMetrics.viewsThisMonth) / performanceMetrics.viewsLastMonth * 100).toFixed(1)}%
                </span>
              )}
              {' '}vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enquiries
            </CardTitle>
            <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnquiries}</div>
            <p className="text-xs text-muted-foreground">
              {performanceMetrics.enquiriesThisMonth > performanceMetrics.enquiriesLastMonth ? (
                <span className="text-green-500">
                  <ArrowUpIcon className="mr-1 inline h-3 w-3" />
                  {((performanceMetrics.enquiriesThisMonth - performanceMetrics.enquiriesLastMonth) / performanceMetrics.enquiriesLastMonth * 100).toFixed(1)}%
                </span>
              ) : (
                <span className="text-red-500">
                  <ArrowDownIcon className="mr-1 inline h-3 w-3" />
                  {((performanceMetrics.enquiriesLastMonth - performanceMetrics.enquiriesThisMonth) / performanceMetrics.enquiriesLastMonth * 100).toFixed(1)}%
                </span>
              )}
              {' '}vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Favorites
            </CardTitle>
            <HeartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFavorites}</div>
            <p className="text-xs text-muted-foreground">
              {performanceMetrics.favoritesThisMonth > performanceMetrics.favoritesLastMonth ? (
                <span className="text-green-500">
                  <ArrowUpIcon className="mr-1 inline h-3 w-3" />
                  {((performanceMetrics.favoritesThisMonth - performanceMetrics.favoritesLastMonth) / performanceMetrics.favoritesLastMonth * 100).toFixed(1)}%
                </span>
              ) : (
                <span className="text-red-500">
                  <ArrowDownIcon className="mr-1 inline h-3 w-3" />
                  {((performanceMetrics.favoritesLastMonth - performanceMetrics.favoritesThisMonth) / performanceMetrics.favoritesLastMonth * 100).toFixed(1)}%
                </span>
              )}
              {' '}vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4"
                >
                  {activity.type === 'view' && (
                    <EyeIcon className="h-4 w-4 text-blue-500" />
                  )}
                  {activity.type === 'enquiry' && (
                    <MessageSquareIcon className="h-4 w-4 text-green-500" />
                  )}
                  {activity.type === 'favorite' && (
                    <HeartIcon className="h-4 w-4 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.propertyTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user?.name || 'Anonymous'} •{' '}
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Property Map */}
        <Card>
          <CardHeader>
            <CardTitle>Property Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyMap
              center={{ lat: 53.3498, lng: -6.2603 }} // Dublin center
              markers={recentListings.map((listing) => ({
                id: listing.id,
                position: { lat: 0, lng: 0 }, // Replace with actual coordinates
                title: listing.title,
                price: formatCurrency(listing.price, listing.currency),
                type: listing.type,
                listingType: listing.listingType,
              }))}
              className="h-[400px]"
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Enquiries</TableHead>
                <TableHead>Favorites</TableHead>
                <TableHead>Listed Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">
                    {listing.title}
                  </TableCell>
                  <TableCell>
                    {listing.type} - {listing.listingType}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(listing.price, listing.currency)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        listing.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : listing.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {listing.status}
                    </span>
                  </TableCell>
                  <TableCell>{listing.views}</TableCell>
                  <TableCell>{listing.enquiries}</TableCell>
                  <TableCell>{listing.favorites}</TableCell>
                  <TableCell>
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}