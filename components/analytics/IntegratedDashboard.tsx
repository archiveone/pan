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
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Users,
  TrendingUp,
  Clock,
  Target,
  Filter,
  Calendar,
  MessageSquare,
  Eye,
  Share2,
  Heart,
  DollarSign,
} from 'lucide-react';

import { enhancedAnalytics } from '@/lib/analytics/enhanced-tracking';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface IntegratedDashboardProps {
  userId?: string;
}

export function IntegratedDashboard({ userId }: IntegratedDashboardProps) {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [crmAnalytics, setCrmAnalytics] = useState<any>(null);
  const [userJourney, setUserJourney] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const [agentAnalytics, crmData, journey] = await Promise.all([
          enhancedAnalytics.getAgentAnalytics(userId || session?.user?.id!, period),
          enhancedAnalytics.getCRMAnalytics(userId || session?.user?.id!, period),
          enhancedAnalytics.getUserJourney(userId || session?.user?.id!),
        ]);

        setAnalytics(agentAnalytics);
        setCrmAnalytics(crmData);
        setUserJourney(journey);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
      setIsLoading(false);
    };

    if (session?.user?.id || userId) {
      fetchAnalytics();
    }
  }, [session, userId, period]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!analytics || !crmAnalytics) {
    return <div>No analytics data available</div>;
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics & CRM Dashboard</h2>
        <div className="flex items-center space-x-4">
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
          <Button variant="outline">
            Export Data
          </Button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="journey">User Journey</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="Total Views"
              value={analytics.listingViews}
              icon={<Eye className="w-4 h-4" />}
              trend={+15}
            />
            <MetricCard
              title="Active Leads"
              value={crmAnalytics.totalLeads}
              icon={<Users className="w-4 h-4" />}
              trend={+8}
            />
            <MetricCard
              title="Conversion Rate"
              value={\`\${((crmAnalytics.totalLeads / analytics.listingViews) * 100).toFixed(1)}%\`}
              icon={<TrendingUp className="w-4 h-4" />}
              trend={+5}
            />
            <MetricCard
              title="Avg. Response Time"
              value={\`\${crmAnalytics.averageResponseTime.toFixed(1)}h\`}
              icon={<Clock className="w-4 h-4" />}
              trend={-12}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Views, leads, and conversions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="views" stroke="#0088FE" />
                      <Line type="monotone" dataKey="leads" stroke="#00C49F" />
                      <Line type="monotone" dataKey="conversions" stroke="#FFBB28" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Lead Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Where your leads are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={crmAnalytics.topSources}
                        dataKey="value"
                        nameKey="source"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {crmAnalytics.topSources.map((entry: any, index: number) => (
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
        </TabsContent>

        {/* CRM Tab */}
        <TabsContent value="crm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Lead Status */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Status</CardTitle>
                <CardDescription>Current status of all leads</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {crmAnalytics.leadsByStatus.map((status: any) => (
                    <div key={status.status} className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{status.status}</span>
                        <span>{status._count} leads</span>
                      </div>
                      <Progress value={(status._count / crmAnalytics.totalLeads) * 100} />
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Lead Types */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Types</CardTitle>
                <CardDescription>Distribution by interaction type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={crmAnalytics.leadsByType} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="type" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="_count" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest interactions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {crmAnalytics.recentActivity?.map((activity: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4 mb-4 pb-4 border-b last:border-0"
                    >
                      <div className="p-2 rounded-full bg-primary/10">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.description}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTimeAgo(activity.timestamp)}
                        </div>
                      </div>
                      <Badge>{activity.type}</Badge>
                    </motion.div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Listings Tab */}
        <TabsContent value="listings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Performing Listings */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Listings</CardTitle>
                <CardDescription>Most viewed and engaged properties</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {analytics.topListings?.map((listing: any, index: number) => (
                    <div key={index} className="mb-4 pb-4 border-b last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{listing.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {listing.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{listing.views} views</div>
                          <div className="text-sm text-muted-foreground">
                            {listing.inquiries} inquiries
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Progress value={(listing.views / analytics.maxViews) * 100} />
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Listing Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Listing Categories</CardTitle>
                <CardDescription>Performance by property type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {analytics.categoryData.map((entry: any, index: number) => (
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
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* User Engagement */}
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>How users interact with listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.engagement || {}).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{key}</span>
                        <span>{value} interactions</span>
                      </div>
                      <Progress value={(value / analytics.totalEngagements) * 100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Time Analysis</CardTitle>
                <CardDescription>When users are most active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.timeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="views" stroke="#0088FE" />
                      <Line type="monotone" dataKey="interactions" stroke="#00C49F" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Device Usage */}
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
                        data={analytics.deviceData}
                        dataKey="value"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {analytics.deviceData.map((entry: any, index: number) => (
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
        </TabsContent>

        {/* User Journey Tab */}
        <TabsContent value="journey">
          <Card>
            <CardHeader>
              <CardTitle>User Journey Timeline</CardTitle>
              <CardDescription>Complete interaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {Object.entries(userJourney || {}).map(([date, events]: [string, any]) => (
                  <div key={date} className="mb-8">
                    <h3 className="font-semibold mb-4">{formatDate(date)}</h3>
                    <div className="space-y-4">
                      {events.map((event: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-4"
                        >
                          <div className="p-2 rounded-full bg-primary/10">
                            {getEventIcon(event.eventType)}
                          </div>
                          <div>
                            <p className="font-medium">{getEventDescription(event)}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTime(event.timestamp)}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
function MetricCard({ title, value, icon, trend }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          <TrendingUp className={`h-4 w-4 mr-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
          {trend > 0 ? '+' : ''}{trend}% from last period
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
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
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

// Helper Functions
function getActivityIcon(type: string) {
  switch (type) {
    case 'VIEW':
      return <Eye className="w-4 h-4" />;
    case 'INQUIRY':
      return <MessageSquare className="w-4 h-4" />;
    case 'SHARE':
      return <Share2 className="w-4 h-4" />;
    case 'FAVORITE':
      return <Heart className="w-4 h-4" />;
    case 'BOOKING':
      return <Calendar className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
}

function getEventIcon(type: string) {
  switch (type) {
    case 'NAVIGATION':
      return <Activity className="w-4 h-4" />;
    case 'SEARCH':
      return <Filter className="w-4 h-4" />;
    case 'INTERACTION':
      return <Target className="w-4 h-4" />;
    case 'CONVERSION':
      return <DollarSign className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
}

function getEventDescription(event: any) {
  switch (event.eventType) {
    case 'NAVIGATION':
      return \`Visited \${event.path}\`;
    case 'SEARCH':
      return \`Searched for "\${event.searchQuery}"\`;
    case 'INTERACTION':
      return \`Interacted with \${event.elementId}\`;
    case 'CONVERSION':
      return \`Completed \${event.conversionType}\`;
    default:
      return \`Unknown event: \${event.eventType}\`;
  }
}

function formatTimeAgo(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return \`\${seconds} seconds ago\`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return \`\${minutes} minutes ago\`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return \`\${hours} hours ago\`;
  const days = Math.floor(hours / 24);
  return \`\${days} days ago\`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}