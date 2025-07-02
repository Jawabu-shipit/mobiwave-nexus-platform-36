
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, MessageSquare, Users, DollarSign } from 'lucide-react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { LoadingState } from '@/components/common/LoadingState';

export function CampaignPerformanceDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const { analyticsData, isLoading } = useAnalyticsData();

  if (isLoading) {
    return <LoadingState message="Loading campaign performance data..." />;
  }

  const performanceData = [
    { date: '2024-01-01', sent: 1200, delivered: 1150, opened: 450, clicked: 89 },
    { date: '2024-01-02', sent: 1500, delivered: 1480, opened: 520, clicked: 102 },
    { date: '2024-01-03', sent: 1100, delivered: 1080, opened: 380, clicked: 76 },
    { date: '2024-01-04', sent: 1800, delivered: 1750, opened: 680, clicked: 145 },
    { date: '2024-01-05', sent: 1600, delivered: 1590, opened: 610, clicked: 128 },
    { date: '2024-01-06', sent: 1400, delivered: 1380, opened: 495, clicked: 98 },
    { date: '2024-01-07', sent: 1750, delivered: 1720, opened: 650, clicked: 134 }
  ];

  const campaignTypes = [
    { name: 'Promotional', value: 45, color: '#3B82F6' },
    { name: 'Transactional', value: 30, color: '#10B981' },
    { name: 'Reminder', value: 15, color: '#F59E0B' },
    { name: 'Alert', value: 10, color: '#EF4444' }
  ];

  const topCampaigns = [
    { name: 'Summer Sale 2024', sent: 5000, deliveryRate: 96.5, openRate: 34.2, revenue: 1250 },
    { name: 'Product Launch Alert', sent: 3200, deliveryRate: 98.1, openRate: 42.1, revenue: 890 },
    { name: 'Weekly Newsletter', sent: 2800, deliveryRate: 95.2, openRate: 28.9, revenue: 450 },
    { name: 'Abandoned Cart Reminder', sent: 1500, deliveryRate: 97.3, openRate: 38.7, revenue: 320 }
  ];

  const exportData = () => {
    // Export functionality would be implemented here
    console.log('Exporting campaign performance data...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Campaign Performance</h2>
          <p className="text-gray-600">Analyze your campaign metrics and performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-3xl font-bold">{analyticsData?.totalMessages ? (analyticsData.totalMessages / 1000).toFixed(2) + 'K' : '0'}</p>
                <p className="text-sm text-green-600">+12% from last period</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-3xl font-bold">{analyticsData?.deliveryRate?.toFixed(1) || '0'}%</p>
                <p className="text-sm text-green-600">+2.1% from last period</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-3xl font-bold">{analyticsData?.openRate?.toFixed(1) || '0'}%</p>
                <p className="text-sm text-green-600">+5.3% from last period</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-3xl font-bold">${analyticsData?.totalCost?.toFixed(0) || '0'}</p>
                <p className="text-sm text-green-600">+18% from last period</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>
            Track delivery, open, and click rates over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sent" stroke="#3B82F6" strokeWidth={2} name="Sent" />
              <Line type="monotone" dataKey="delivered" stroke="#10B981" strokeWidth={2} name="Delivered" />
              <Line type="monotone" dataKey="opened" stroke="#F59E0B" strokeWidth={2} name="Opened" />
              <Line type="monotone" dataKey="clicked" stroke="#EF4444" strokeWidth={2} name="Clicked" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Types</CardTitle>
            <CardDescription>
              Distribution of campaign types sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={campaignTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {campaignTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Campaigns</CardTitle>
            <CardDescription>
              Best performing campaigns by engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCampaigns.map((campaign, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{campaign.name}</h3>
                    <span className="text-green-600 font-bold">${campaign.revenue}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Sent</p>
                      <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Delivery Rate</p>
                      <p className="font-medium">{campaign.deliveryRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Open Rate</p>
                      <p className="font-medium">{campaign.openRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
