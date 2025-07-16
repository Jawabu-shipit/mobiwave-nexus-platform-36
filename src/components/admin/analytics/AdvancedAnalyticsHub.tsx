import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Download,
  Filter,
  Calendar,
  Eye,
  Target,
  Zap
} from 'lucide-react';
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { UserBehaviorAnalytics } from './UserBehaviorAnalytics';
import { RevenueAnalytics } from './RevenueAnalytics';
import { PerformanceOptimizer } from './PerformanceOptimizer';
import { RealTimeMetricsDashboard } from './RealTimeMetricsDashboard';
import { SystemAnalyticsDashboard } from './SystemAnalyticsDashboard';

export function AdvancedAnalyticsHub() {
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [timeFrame, setTimeFrame] = useState('30d');

  const analyticsModules = [
    {
      id: 'predictive',
      title: 'Predictive Analytics',
      description: 'AI-powered forecasting and trend analysis',
      icon: <TrendingUp className="w-5 h-5" />,
      component: <PredictiveAnalytics />
    },
    {
      id: 'behavior',
      title: 'User Behavior',
      description: 'Deep dive into user interactions and patterns',
      icon: <Users className="w-5 h-5" />,
      component: <UserBehaviorAnalytics />
    },
    {
      id: 'revenue',
      title: 'Revenue Analytics',
      description: 'Financial performance and revenue optimization',
      icon: <DollarSign className="w-5 h-5" />,
      component: <RevenueAnalytics />
    },
    {
      id: 'performance',
      title: 'Performance Optimizer',
      description: 'System performance insights and recommendations',
      icon: <Zap className="w-5 h-5" />,
      component: <PerformanceOptimizer />
    },
    {
      id: 'realtime',
      title: 'Real-time Metrics',
      description: 'Live monitoring and instant insights',
      icon: <Activity className="w-5 h-5" />,
      component: <RealTimeMetricsDashboard />
    },
    {
      id: 'system',
      title: 'System Analytics',
      description: 'Infrastructure and system performance metrics',
      icon: <BarChart3 className="w-5 h-5" />,
      component: <SystemAnalyticsDashboard />
    }
  ];

  const keyMetrics = [
    { label: 'Total Users', value: '12,847', change: '+12.5%', trend: 'up' },
    { label: 'Revenue', value: '$48,392', change: '+8.3%', trend: 'up' },
    { label: 'Conversion Rate', value: '3.8%', change: '+0.5%', trend: 'up' },
    { label: 'Avg Session', value: '4m 32s', change: '-2.1%', trend: 'down' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Analytics Hub</h2>
          <p className="text-gray-600">
            Comprehensive business intelligence and data insights platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Time Range:</span>
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Focus:</span>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="users">User Metrics</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
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

      {/* Analytics Modules */}
      <Tabs defaultValue="predictive" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full grid-cols-6">
            {analyticsModules.map((module) => (
              <TabsTrigger key={module.id} value={module.id} className="flex items-center gap-2">
                {module.icon}
                <span className="hidden sm:inline">{module.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {analyticsModules.map((module) => (
          <TabsContent key={module.id} value={module.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {module.icon}
                  <div>
                    <CardTitle>{module.title}</CardTitle>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {module.component}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
