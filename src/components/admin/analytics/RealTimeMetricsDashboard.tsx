
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Users, 
  Zap, 
  TrendingUp, 
  Eye,
  MessageSquare,
  DollarSign,
  Clock,
  RefreshCw,
  Pause,
  Play
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RealTimeMetricsDashboard() {
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time data updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const realTimeMetrics = [
    {
      title: 'Active Users',
      value: '1,247',
      change: '+23',
      changePercent: '+1.9%',
      trend: 'up',
      icon: <Users className="w-4 h-4" />
    },
    {
      title: 'Page Views',
      value: '8,532',
      change: '+156',
      changePercent: '+1.8%',
      trend: 'up',
      icon: <Eye className="w-4 h-4" />
    },
    {
      title: 'Live Sessions',
      value: '892',
      change: '-12',
      changePercent: '-1.3%',
      trend: 'down',
      icon: <Activity className="w-4 h-4" />
    },
    {
      title: 'Revenue/Hour',
      value: '$2,847',
      change: '+$127',
      changePercent: '+4.7%',
      trend: 'up',
      icon: <DollarSign className="w-4 h-4" />
    }
  ];

  const liveActivityData = [
    { time: '14:50', users: 1220, sessions: 890, revenue: 2720 },
    { time: '14:51', users: 1235, sessions: 895, revenue: 2745 },
    { time: '14:52', users: 1247, sessions: 892, revenue: 2782 },
    { time: '14:53', users: 1241, sessions: 888, revenue: 2801 },
    { time: '14:54', users: 1253, sessions: 901, revenue: 2847 },
  ];

  const liveEvents = [
    { time: '14:54:32', event: 'New user registration', user: 'john.doe@email.com', type: 'success' },
    { time: '14:54:18', event: 'Premium subscription', user: 'jane.smith@email.com', type: 'revenue' },
    { time: '14:54:05', event: 'API rate limit exceeded', user: 'system', type: 'warning' },
    { time: '14:53:47', event: 'Large file upload', user: 'mike.wilson@email.com', type: 'info' },
    { time: '14:53:22', event: 'Password reset request', user: 'sarah.brown@email.com', type: 'info' }
  ];

  const topPages = [
    { page: '/dashboard', visitors: 342, duration: '3m 45s' },
    { page: '/services', visitors: 187, duration: '2m 12s' },
    { page: '/billing', visitors: 98, duration: '4m 18s' },
    { page: '/analytics', visitors: 76, duration: '5m 32s' },
    { page: '/settings', visitors: 54, duration: '2m 08s' }
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="flex items-center gap-2"
          >
            {isLive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isLive ? 'Pause' : 'Resume'} Live Updates
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="w-3 h-3" />
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
        {isLive && (
          <Badge variant="default" className="animate-pulse">
            <Activity className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        )}
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {realTimeMetrics.map((metric, index) => (
          <Card key={index} className={isLive ? 'border-green-200' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {metric.icon}
                    <span className="text-sm font-medium text-gray-600">{metric.title}</span>
                  </div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className={metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                      {metric.change}
                    </span>
                    <span className="text-gray-500">({metric.changePercent})</span>
                  </div>
                </div>
                {isLive && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Live Activity Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={liveActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    name="Active Users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="Sessions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Live Events Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Live Events Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {liveEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    event.type === 'success' ? 'bg-green-500' :
                    event.type === 'revenue' ? 'bg-blue-500' :
                    event.type === 'warning' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{event.event}</span>
                      <Badge 
                        variant={event.type === 'revenue' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {event.type}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{event.user}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Clock className="w-3 h-3" />
                      {event.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Activity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Current Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Top Pages (Live Visitors)</h4>
              <div className="space-y-2">
                {topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{page.page}</div>
                      <div className="text-xs text-gray-500">Avg. {page.duration}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{page.visitors}</div>
                      <div className="text-xs text-gray-500">visitors</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Geographic Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">🇺🇸 United States</span>
                  <span className="font-medium">427 users</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">🇬🇧 United Kingdom</span>
                  <span className="font-medium">234 users</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">🇨🇦 Canada</span>
                  <span className="font-medium">189 users</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">🇩🇪 Germany</span>
                  <span className="font-medium">156 users</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
