
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, Users, MessageSquare, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';

export function RealTimeDashboard() {
  const { metrics, campaignMetrics, isConnected } = useRealTimeMetrics();

  const getStatusColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSystemHealthStatus = () => {
    if (metrics.systemLoad < 70 && metrics.errorRate < 2) return 'Healthy';
    if (metrics.systemLoad < 85 && metrics.errorRate < 5) return 'Warning';
    return 'Critical';
  };

  const healthStatus = getSystemHealthStatus();
  const healthColor = healthStatus === 'Healthy' ? 'bg-green-100 text-green-800' : 
                    healthStatus === 'Warning' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Dashboard</h2>
          <p className="text-gray-600 flex items-center gap-2">
            Live system metrics and performance indicators
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="font-medium">{metrics.lastUpdated.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            System Health Overview
            <Badge className={healthColor}>{healthStatus}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">System Load</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-2xl font-bold">{metrics.systemLoad.toFixed(1)}%</span>
                  <span className={`text-sm ${getStatusColor(100 - metrics.systemLoad, 30)}`}>
                    {metrics.systemLoad < 70 ? 'Good' : metrics.systemLoad < 85 ? 'High' : 'Critical'}
                  </span>
                </div>
                <Progress value={metrics.systemLoad} className="h-2" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Active Users</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-2xl font-bold">{metrics.activeUsers}</span>
                  <span className="text-sm text-green-600">Online</span>
                </div>
                <Progress value={(metrics.activeUsers / 100) * 100} className="h-2" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Messages/Min</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-2xl font-bold">{metrics.messagesPerMinute}</span>
                  <span className={`text-sm ${getStatusColor(metrics.messagesPerMinute, 10)}`}>
                    {metrics.messagesPerMinute > 20 ? 'High' : metrics.messagesPerMinute > 5 ? 'Normal' : 'Low'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Processing rate</div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Error Rate</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-2xl font-bold">{metrics.errorRate.toFixed(1)}%</span>
                  <span className={`text-sm ${getStatusColor(10 - metrics.errorRate, 8)}`}>
                    {metrics.errorRate < 2 ? 'Good' : metrics.errorRate < 5 ? 'Warning' : 'Critical'}
                  </span>
                </div>
                <Progress value={metrics.errorRate * 10} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Campaign Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{metrics.activeCampaigns}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {campaignMetrics?.totalDelivered.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">Delivered</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.deliveryRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
              
              {campaignMetrics?.recentActivity && (
                <div>
                  <h4 className="font-medium mb-2">Message Volume (Last Hour)</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={campaignMetrics.recentActivity}>
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                        formatter={(value) => [value, 'Messages']}
                      />
                      <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Delivery Rate</span>
                  <span className="text-lg font-bold">{metrics.deliveryRate.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.deliveryRate} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">System Performance</span>
                  <span className="text-lg font-bold">{(100 - metrics.systemLoad).toFixed(1)}%</span>
                </div>
                <Progress value={100 - metrics.systemLoad} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Reliability Score</span>
                  <span className="text-lg font-bold">{(100 - metrics.errorRate * 10).toFixed(1)}%</span>
                </div>
                <Progress value={100 - metrics.errorRate * 10} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Uptime</span>
                    <div className="font-semibold">99.9%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Response Time</span>
                    <div className="font-semibold">120ms</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
