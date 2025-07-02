
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  MousePointer, 
  Clock, 
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
  Target
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export function UserBehaviorAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [userSegment, setUserSegment] = useState('all');

  const pageViewData = [
    { page: 'Dashboard', views: 12847, avgTime: '4:32', bounceRate: 23 },
    { page: 'SMS Campaign', views: 8934, avgTime: '6:18', bounceRate: 15 },
    { page: 'Analytics', views: 6521, avgTime: '3:45', bounceRate: 32 },
    { page: 'Contacts', views: 5432, avgTime: '2:56', bounceRate: 28 },
    { page: 'Settings', views: 3210, avgTime: '1:43', bounceRate: 45 }
  ];

  const userFlowData = [
    { step: 'Landing', users: 10000, conversion: 100 },
    { step: 'Sign Up', users: 7500, conversion: 75 },
    { step: 'Onboarding', users: 6200, conversion: 62 },
    { step: 'First Action', users: 4800, conversion: 48 },
    { step: 'Active User', users: 3600, conversion: 36 }
  ];

  const deviceData = [
    { name: 'Desktop', value: 65, color: '#8884d8' },
    { name: 'Mobile', value: 28, color: '#82ca9d' },
    { name: 'Tablet', value: 7, color: '#ffc658' }
  ];

  const engagementMetrics = [
    { metric: 'Session Duration', value: '5m 23s', change: '+12%', trend: 'up' },
    { metric: 'Pages per Session', value: '3.8', change: '+5%', trend: 'up' },
    { metric: 'Bounce Rate', value: '24%', change: '-8%', trend: 'down' },
    { metric: 'Return Rate', value: '68%', change: '+15%', trend: 'up' }
  ];

  const userSegments = [
    { name: 'New Users', count: 2847, percentage: 23, growth: '+18%' },
    { name: 'Active Users', count: 8934, percentage: 72, growth: '+12%' },
    { name: 'Power Users', count: 623, percentage: 5, growth: '+25%' }
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">Time Range:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Segment:</span>
          <Select value={userSegment} onValueChange={setUserSegment}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="new">New Users</SelectItem>
              <SelectItem value="returning">Returning</SelectItem>
              <SelectItem value="power">Power Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {engagementMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.metric}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <div className="flex items-center gap-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <Badge 
                    variant={metric.trend === 'up' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {metric.change}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pageViewData.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{page.page}</span>
                      <span className="text-sm text-gray-600">{page.views.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Avg Time: {page.avgTime}</span>
                      <span>Bounce: {page.bounceRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="w-5 h-5" />
              Device Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            User Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userFlowData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="step" type="category" />
                <Tooltip />
                <Bar dataKey="users" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* User Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Segments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userSegments.map((segment, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{segment.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {segment.growth}
                  </Badge>
                </div>
                <p className="text-2xl font-bold mb-1">{segment.count.toLocaleString()}</p>
                <div className="flex items-center gap-2">
                  <Progress value={segment.percentage} className="flex-1 h-2" />
                  <span className="text-sm text-gray-600">{segment.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Behavioral Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Peak Usage</span>
              </div>
              <p className="text-sm text-blue-700">
                Most users are active between 9 AM and 2 PM on weekdays
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Engagement Growth</span>
              </div>
              <p className="text-sm text-green-700">
                User engagement has increased 23% over the last month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
