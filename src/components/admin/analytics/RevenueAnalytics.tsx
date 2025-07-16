
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Target,
  Calendar,
  Users,
  Percent
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function RevenueAnalytics() {
  const [timeframe, setTimeframe] = useState('6m');

  const revenueData = [
    { month: 'Jan', revenue: 45000, subscriptions: 320, churn: 25 },
    { month: 'Feb', revenue: 52000, subscriptions: 380, churn: 22 },
    { month: 'Mar', revenue: 48000, subscriptions: 350, churn: 28 },
    { month: 'Apr', revenue: 61000, subscriptions: 420, churn: 20 },
    { month: 'May', revenue: 58000, subscriptions: 410, churn: 24 },
    { month: 'Jun', revenue: 67000, subscriptions: 480, churn: 18 }
  ];

  const planDistribution = [
    { name: 'Starter', value: 35, revenue: 24500, color: '#3b82f6' },
    { name: 'Professional', value: 45, revenue: 67500, color: '#10b981' },
    { name: 'Enterprise', value: 20, revenue: 89000, color: '#f59e0b' }
  ];

  const cohortData = [
    { month: 'Jan', month1: 100, month2: 85, month3: 72, month4: 65, month5: 58, month6: 52 },
    { month: 'Feb', month1: 100, month2: 88, month3: 76, month4: 68, month5: 61, month6: null },
    { month: 'Mar', month1: 100, month2: 82, month3: 71, month4: 64, month5: null, month6: null },
    { month: 'Apr', month1: 100, month2: 90, month3: 78, month4: null, month5: null, month6: null },
    { month: 'May', month1: 100, month2: 86, month3: null, month4: null, month5: null, month6: null },
    { month: 'Jun', month1: 100, month2: null, month3: null, month4: null, month5: null, month6: null }
  ];

  const revenueMetrics = [
    { 
      title: 'Monthly Revenue', 
      value: '$67,000', 
      change: '+18.3%', 
      trend: 'up',
      icon: <DollarSign className="w-4 h-4" />
    },
    { 
      title: 'ARPU', 
      value: '$139.58', 
      change: '+5.2%', 
      trend: 'up',
      icon: <Users className="w-4 h-4" />
    },
    { 
      title: 'Churn Rate', 
      value: '3.2%', 
      change: '-1.1%', 
      trend: 'down',
      icon: <TrendingDown className="w-4 h-4" />
    },
    { 
      title: 'LTV:CAC', 
      value: '4.2:1', 
      change: '+0.3', 
      trend: 'up',
      icon: <Target className="w-4 h-4" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {metric.icon}
                    <span className="text-sm font-medium text-gray-600">{metric.title}</span>
                  </div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                </div>
                <Badge 
                  variant={metric.trend === 'up' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {metric.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="plans">Plan Distribution</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Revenue & Subscription Trends
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">Last 3 months</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? `$${value.toLocaleString()}` : value,
                        name === 'revenue' ? 'Revenue' : 'Subscriptions'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution by Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {planDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {planDistribution.map((plan, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: plan.color }}
                        />
                        <span className="font-medium">{plan.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${plan.revenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{plan.value}% of users</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Cohort Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Cohort retention analysis showing customer lifetime value patterns</p>
                <p className="text-sm mt-2">Track how revenue retention changes over time for different customer cohorts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Next Month</span>
                    <span className="text-lg font-bold text-green-600">$72,500</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Next Quarter</span>
                    <span className="text-lg font-bold text-blue-600">$215,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">End of Year</span>
                    <span className="text-lg font-bold text-purple-600">$850,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Monthly Growth Rate</span>
                    <Badge variant="default">12.5%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Customer Acquisition Cost</span>
                    <span className="font-medium">$45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Customer Lifetime Value</span>
                    <span className="font-medium">$1,890</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Payback Period</span>
                    <span className="font-medium">3.2 months</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
