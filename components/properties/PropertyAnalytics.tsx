"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/format';

interface PropertyAnalyticsProps {
  propertyId: string;
  data: {
    priceHistory: Array<{
      date: string;
      price: number;
    }>;
    viewingStats: Array<{
      month: string;
      count: number;
    }>;
    offerStats: Array<{
      month: string;
      count: number;
      averageAmount: number;
    }>;
    comparableProperties: Array<{
      id: string;
      price: number;
      size: number;
      type: string;
      listingType: string;
      daysOnMarket: number;
    }>;
    marketInsights: {
      averagePrice: number;
      medianPrice: number;
      pricePerSqm: number;
      averageDaysOnMarket: number;
      totalListings: number;
      listingsByType: Array<{
        type: string;
        count: number;
      }>;
    };
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function PropertyAnalytics({ propertyId, data }: PropertyAnalyticsProps) {
  const [timeframe, setTimeframe] = useState('6M');

  const filterDataByTimeframe = (data: any[], dateKey: string) => {
    const now = new Date();
    const months = timeframe === '1Y' ? 12 : timeframe === '6M' ? 6 : 3;
    const cutoff = new Date(now.setMonth(now.getMonth() - months));
    return data.filter((item) => new Date(item[dateKey]) >= cutoff);
  };

  const priceHistoryData = filterDataByTimeframe(data.priceHistory, 'date');
  const viewingStatsData = filterDataByTimeframe(data.viewingStats, 'month');
  const offerStatsData = filterDataByTimeframe(data.offerStats, 'month');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Property Analytics</h2>
        <Select
          value={timeframe}
          onValueChange={setTimeframe}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3M">3 Months</SelectItem>
            <SelectItem value="6M">6 Months</SelectItem>
            <SelectItem value="1Y">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Price History */}
        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    tickFormatter={(value) => `€${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, 'EUR')}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#0088FE"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Viewing Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Viewing Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewingStatsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Offer Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Offer Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={offerStatsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(value) => `€${value / 1000}k`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => `${value} offers`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      name === 'averageAmount'
                        ? formatCurrency(value, 'EUR')
                        : `${value} offers`
                    }
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="averageAmount"
                    stroke="#0088FE"
                    name="Average Offer"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="count"
                    stroke="#FFBB28"
                    name="Number of Offers"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Market Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Market Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.marketInsights.listingsByType}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.type}: ${entry.count}`}
                  >
                    {data.marketInsights.listingsByType.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Average Price</p>
              <p className="text-2xl font-bold">
                {formatCurrency(data.marketInsights.averagePrice, 'EUR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price per m²</p>
              <p className="text-2xl font-bold">
                {formatCurrency(data.marketInsights.pricePerSqm, 'EUR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Days on Market</p>
              <p className="text-2xl font-bold">
                {data.marketInsights.averageDaysOnMarket} days
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Listings</p>
              <p className="text-2xl font-bold">
                {data.marketInsights.totalListings}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}