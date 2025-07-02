
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const responseTimeData = [
  { time: '00:00', response_time: 45 },
  { time: '04:00', response_time: 52 },
  { time: '08:00', response_time: 38 },
  { time: '12:00', response_time: 67 },
  { time: '16:00', response_time: 43 },
  { time: '20:00', response_time: 56 },
];

const requestsData = [
  { hour: '00', requests: 120 },
  { hour: '04', requests: 80 },
  { hour: '08', requests: 350 },
  { hour: '12', requests: 450 },
  { hour: '16', requests: 380 },
  { hour: '20', requests: 290 },
];

const endpointStats = [
  { endpoint: '/api/users', requests: 1250, avg_response: 45, success_rate: 99.2 },
  { endpoint: '/api/services', requests: 890, avg_response: 67, success_rate: 98.8 },
  { endpoint: '/api/campaigns', requests: 670, avg_response: 123, success_rate: 97.5 },
  { endpoint: '/api/analytics', requests: 340, avg_response: 189, success_rate: 99.8 },
];

export function ApiMonitoringDashboard() {
  const totalRequests = 24567;
  const averageResponseTime = 78;
  const successRate = 98.9;
  const activeEndpoints = 24;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+5.2%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.3%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Endpoints</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEndpoints}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">2 new</span> this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="response_time" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={requestsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Endpoint Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {endpointStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <code className="font-mono text-sm">{stat.endpoint}</code>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{stat.requests.toLocaleString()}</div>
                    <div className="text-gray-500">Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{stat.avg_response}ms</div>
                    <div className="text-gray-500">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <Badge variant={stat.success_rate > 98 ? "default" : "destructive"}>
                      {stat.success_rate}%
                    </Badge>
                    <div className="text-gray-500">Success</div>
                  </div>
                  <div className="flex items-center">
                    {stat.success_rate > 98 ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
