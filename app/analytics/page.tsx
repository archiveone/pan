'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import {
  TrendingUp,
  Users,
  CheckSquare,
  FileText,
  MessageSquare,
  DollarSign,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface AnalyticsData {
  properties: {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    totalValue: number;
    monthlyTrends: Array<{
      month: string;
      total: number;
      value: number;
    }>;
  };
  leads: {
    total: number;
    converted: number;
    conversionRate: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
    monthlyTrends: Array<{
      month: string;
      total: number;
      converted: number;
    }>;
  };
  tasks: {
    total: number;
    completed: number;
    completionRate: number;
    byPriority: Record<string, number>;
    overdue: number;
    monthlyTrends: Array<{
      month: string;
      total: number;
      completed: number;
    }>;
  };
  files: {
    total: number;
    totalSize: number;
    byType: Record<string, number>;
    byFolder: Record<string, number>;
    monthlyTrends: Array<{
      month: string;
      total: number;
      size: number;
    }>;
  };
  messages: {
    total: number;
    sent: number;
    received: number;
    unread: number;
    monthlyTrends: Array<{
      month: string;
      sent: number;
      received: number;
    }>;
  };
  revenue: {
    totalRevenue: number;
    totalTransactions: number;
    averageTransaction: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    monthlyTrends: Array<{
      month: string;
      revenue: number;
      count: number;
    }>;
  };
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [period, setPeriod] = useState('6');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  if (!data) {
    return <div>Failed to load analytics</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select
            value={period}
            onValueChange={setPeriod}
            className="w-40"
          >
            <option value="3">Last 3 months</option>
            <option value="6">Last 6 months</option>
            <option value="12">Last 12 months</option>
          </Select>
          <Button onClick={fetchAnalytics}>Refresh</Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Properties
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.properties.total}</div>
            <p className="text-xs text-muted-foreground">
              Value: {formatCurrency(data.properties.totalValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lead Conversion
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.leads.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.leads.converted} of {data.leads.total} leads
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Task Completion
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.tasks.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.tasks.completed} of {data.tasks.total} tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Property Trends</CardTitle>
            <CardDescription>
              Monthly property listings and total value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.properties.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="total"
                  stroke="#8884d8"
                  name="Properties"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="value"
                  stroke="#82ca9d"
                  name="Value"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Conversion */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Conversion</CardTitle>
            <CardDescription>
              Monthly lead generation and conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.leads.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="Total Leads" />
                <Bar dataKey="converted" fill="#82ca9d" name="Converted" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>
              Tasks by priority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(data.tasks.byPriority).map(([key, value]) => ({
                    name: key,
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {Object.entries(data.tasks.byPriority).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>
              Monthly revenue and transaction count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenue.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  name="Revenue"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="count"
                  stroke="#82ca9d"
                  name="Transactions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>File Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Files:</span>
                <span>{data.files.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Size:</span>
                <span>{(data.files.totalSize / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Messages:</span>
                <span>{data.messages.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Unread:</span>
                <span>{data.messages.unread}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Revenue:</span>
                <span>{formatCurrency(data.revenue.totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Transaction:</span>
                <span>{formatCurrency(data.revenue.averageTransaction)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}