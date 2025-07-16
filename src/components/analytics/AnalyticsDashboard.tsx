
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MessageSquare, Users, DollarSign, TrendingUp, Calendar, Clock, Target, AlertCircle } from 'lucide-react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { LoadingState } from '@/components/common/LoadingState';

const SAMPLE_DATA = {
  messageVolume: [
    { date: '2024-01-01', sms: 120, email: 45, whatsapp: 23 },
    { date: '2024-01-02', sms: 156, email: 67, whatsapp: 34 },
    { date: '2024-01-03', sms: 189, email: 89, whatsapp: 45 },
    { date: '2024-01-04', sms: 234, email: 123, whatsapp: 67 },
    { date: '2024-01-05', sms: 278, email: 145, whatsapp: 89 },
    { date: '2024-01-06', sms: 312, email: 167, whatsapp: 102 },
    { date: '2024-01-07', sms: 345, email: 189, whatsapp: 134 }
  ],
  deliveryRates: [
    { name: 'Delivered', value: 94.5, count: 1890 },
    { name: 'Failed', value: 3.2, count: 64 },
    { name: 'Pending', value: 2.3, count: 46 }
  ],
  campaignPerformance: [
    { name: 'Holiday Promo', sent: 1500, delivered: 1425, opened: 987, clicked: 234 },
    { name: 'Weekly Newsletter', sent: 2300, delivered: 2187, opened: 1456, clicked: 345 },
    { name: 'Product Launch', sent: 890, delivered: 845, opened: 567, clicked: 123 },
    { name: 'Customer Survey', sent: 1200, delivered: 1140, opened: 789, clicked: 156 }
  ],
  costAnalysis: [
    { month: 'Jan', sms: 45.67, email: 12.34, whatsapp: 23.45 },
    { month: 'Feb', sms: 67.89, email: 23.45, whatsapp: 34.56 },
    { month: 'Mar', sms: 89.12, email: 34.56, whatsapp: 45.67 },
    { month: 'Apr', sms: 123.45, email: 45.67, whatsapp: 56.78 },
    { month: 'May', sms: 156.78, email: 56.78, whatsapp: 67.89 },
    { month: 'Jun', sms: 189.23, email: 67.89, whatsapp: 78.90 }
  ]
};

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [messageType, setMessageType] = useState('all');
  const { analyticsData, isLoading } = useAnalyticsData();

  if (isLoading) {
    return <LoadingState message="Loading analytics data..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights into your messaging campaigns</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={messageType} onValueChange={setMessageType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="sms">SMS Only</SelectItem>
              <SelectItem value="email">Email Only</SelectItem>
              <SelectItem value="whatsapp">WhatsApp Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold">{analyticsData?.totalMessages.toLocaleString() || '0'}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className={`w-3 h-3 ${analyticsData?.previousPeriodComparison.messagesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-xs ${analyticsData?.previousPeriodComparison.messagesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analyticsData?.previousPeriodComparison.messagesGrowth >= 0 ? '+' : ''}{analyticsData?.previousPeriodComparison.messagesGrowth.toFixed(1) || '0'}%
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold">{analyticsData?.deliveryRate.toFixed(1) || '0'}%</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className={`w-3 h-3 ${analyticsData?.previousPeriodComparison.deliveryRateGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-xs ${analyticsData?.previousPeriodComparison.deliveryRateGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analyticsData?.previousPeriodComparison.deliveryRateGrowth >= 0 ? '+' : ''}{analyticsData?.previousPeriodComparison.deliveryRateGrowth.toFixed(1) || '0'}%
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold">${analyticsData?.totalCost.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className={`w-3 h-3 ${analyticsData?.previousPeriodComparison.costGrowth >= 0 ? 'text-red-600' : 'text-green-600'}`} />
              <span className={`text-xs ${analyticsData?.previousPeriodComparison.costGrowth >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {analyticsData?.previousPeriodComparison.costGrowth >= 0 ? '+' : ''}{analyticsData?.previousPeriodComparison.costGrowth.toFixed(1) || '0'}%
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold">{analyticsData?.activeCampaigns || '0'}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-blue-600">{analyticsData?.scheduledCampaigns || '0'} scheduled</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Message Volume Trends</CardTitle>
                <CardDescription>Daily message volumes by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={SAMPLE_DATA.messageVolume}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="sms" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                    <Area type="monotone" dataKey="email" stackId="1" stroke="#10b981" fill="#10b981" />
                    <Area type="monotone" dataKey="whatsapp" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Status Distribution</CardTitle>
                <CardDescription>Overall delivery performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={SAMPLE_DATA.deliveryRates}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {SAMPLE_DATA.deliveryRates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Delivery and engagement metrics by campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={SAMPLE_DATA.campaignPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                  <Bar dataKey="delivered" fill="#10b981" name="Delivered" />
                  <Bar dataKey="opened" fill="#f59e0b" name="Opened" />
                  <Bar dataKey="clicked" fill="#8b5cf6" name="Clicked" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_DATA.deliveryRates.map((rate, index) => (
              <Card key={rate.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{rate.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{rate.value}%</span>
                    <Badge 
                      variant={rate.name === 'Delivered' ? 'default' : 'destructive'}
                      className={rate.name === 'Delivered' ? 'bg-green-600' : ''}
                    >
                      {rate.count} messages
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
              <CardDescription>Monthly spending by message type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={SAMPLE_DATA.costAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="sms" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="email" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="whatsapp" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
