'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Users, 
  Clock, 
  Search, 
  MapPin, 
  Monitor, 
  Smartphone, 
  Tablet,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

import { analyticsService } from '@/lib/analytics';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface AgentDashboardProps {
  agentId?: string;
}

export function AgentDashboard({ agentId }: AgentDashboardProps) {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const data = await analyticsService.getAgentAnalytics(
          agentId || session?.user?.id!,
          period
        );
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
      setIsLoading(false);
    };

    if (session?.user?.id || agentId) {
      fetchAnalytics();
    }
  }, [session, agentId, period]);

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  const {
    listingViews,
    listingPerformance,
    inquiries,
    demographics,
    topSearchTerms,
  } = analytics;

  // Prepare chart data
  const listingPerformanceData = listingPerformance.map((listing: any) => ({
    name: listing.title,
    views: listing.viewCount,
    inquiries: listing._count.inquiries,
    bookings: listing._count.bookings,
  }));

  const deviceData = demographics.reduce((acc: any, curr: any) => {
    acc[curr.deviceType] = (acc[curr.deviceType] || 0) + curr._count;
    return acc;
  }, {});

  const locationData = demographics.map((loc: any) => ({
    name: \`\${loc.city || ''}, \${loc.region || ''}\`,
    value: loc._count,
  }));

  const searchTermsData = topSearchTerms.map((term: any) => ({
    term: term.searchQuery,
    count: term._count,
  }));

  return (
    <div className="space-y-4 p-4">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={listingViews}
          icon={<Eye className="w-4 h-4" />}
          description="Across all listings"
        />
        <MetricCard
          title="Inquiries"
          value={inquiries.length}
          icon={<MessageSquare className="w-4 h-4" />}
          description="New inquiries received"
        />
        <MetricCard
          title="Conversion Rate"
          value={\`\${((inquiries.length / listingViews) * 100).toFixed(1)}%\`}
          icon={<TrendingUp className="w-4 h-4" />}
          description="Views to inquiries"
        />
        <MetricCard
          title="Active Listings"
          value={listingPerformance.length}
          icon={<Users className="w-4 h-4" />}
          description="Currently listed"
        />
      </div>

      {/* Listing Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Listing Performance</CardTitle>
          <CardDescription>Views, inquiries, and bookings by listing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={listingPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#0088FE" name="Views" />
                <Bar dataKey="inquiries" fill="#00C49F" name="Inquiries" />
                <Bar dataKey="bookings" fill="#FFBB28" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Demographics and Device Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Visitor Locations</CardTitle>
            <CardDescription>Where your viewers are from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {locationData.map((entry: any, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Usage</CardTitle>
            <CardDescription>How users access your listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(deviceData).map(([key, value]) => ({
                      name: key,
                      value,
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {Object.keys(deviceData).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Terms and Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Search Terms</CardTitle>
            <CardDescription>Terms leading to your listings</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {searchTermsData.map((term: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span>{term.term}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {term.count} views
                  </span>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
            <CardDescription>Latest messages from potential clients</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {inquiries.map((inquiry: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4 py-4 border-b last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{inquiry.user.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {inquiry.listing.title}
                    </p>
                  </div>
                </motion.div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, description }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px]" />
              <Skeleton className="h-4 w-[120px] mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}