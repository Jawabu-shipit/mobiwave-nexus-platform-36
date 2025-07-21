
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Activity, Users, MessageSquare, Clock, DollarSign, Download } from 'lucide-react';

export function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('delivery_rate');

  // Mock data - in real app, fetch from API
  const deliveryData = [
    { date: '2024-01-01', sent: 1250, delivered: 1190, failed: 60, opened: 890, clicked: 156 },
    { date: '2024-01-02', sent: 1380, delivered: 1340, failed: 40, opened: 945, clicked: 189 },
    { date: '2024-01-03', sent: 1150, delivered: 1120, failed: 30, opened: 798, clicked: 143 },
    { date: '2024-01-04', sent: 1420, delivered: 1380, failed: 40, opened: 1035, clicked: 207 },
    { date: '2024-01-05', sent: 1320, delivered: 1290, failed: 30, opened: 967, clicked: 193 },
    { date: '2024-01-06', sent: 1180, delivered: 1150, failed: 30, opened: 862, clicked: 155 },
    { date: '2024-01-07', sent: 1450, delivered: 1420, failed: 30, opened: 1065, clicked: 213 }
  ];

  const campaignPerformance = [
    { name: 'Welcome Series', sent: 5200, delivered: 5100, opened: 3825, clicked: 765, ctr: 15.0, cost: 260 },
    { name: 'Promotional', sent: 3800, delivered: 3720, opened: 2604, clicked: 446, ctr: 12.0, cost: 190 },
    { name: 'Reminders', sent: 2100, delivered: 2050, opened: 1435, clicked: 287, ctr: 14.0, cost: 105 },
    { name: 'Newsletters', sent: 1500, delivered: 1470, opened: 882, clicked: 147, ctr: 10.0, cost: 75 }
  ];

  const geographicData = [
    { region: 'North America', messages: 4200, delivered: 4100, rate: 97.6 },
    { region: 'Europe', messages: 3800, delivered: 3720, rate: 97.9 },
    { region: 'Asia Pacific', messages: 2900, delivered: 2800, rate: 96.5 },
    { region: 'Latin America', messages: 1200, delivered: 1150, rate: 95.8 },
    { region: 'Middle East', messages: 800, delivered: 760, rate: 95.0 }
  ];

  const timeAnalysis = [
    { hour: '00:00', delivered: 45, opened: 12, clicked: 2 },
    { hour: '06:00', delivered: 180, opened: 54, clicked: 12 },
    { hour: '09:00', delivered: 320, opened: 128, clicked: 38 },
    { hour: '12:00', delivered: 450, opened: 225, clicked: 67 },
    { hour: '15:00', delivered: 380, opened: 152, clicked: 46 },
    { hour: '18:00', delivered: 520, opened: 260, clicked: 78 },
    { hour: '21:00', delivered: 290, opened: 116, clicked: 35 }
  ];

  const deviceTypes = [
    { name: 'Mobile', value: 75, color: '#3B82F6' },
    { name: 'Desktop', value: 20, color: '#10B981' },
    { name: 'Tablet', value: 5, color: '#F59E0B' }
  ];

  const calculateMetrics = () => {
    const totalSent = deliveryData.reduce((sum, day) => sum + day.sent, 0);
    const totalDelivered = deliveryData.reduce((sum, day) => sum + day.delivered, 0);
    const totalOpened = deliveryData.reduce((sum, day) => sum + day.opened, 0);
    const totalClicked = deliveryData.reduce((sum, day) => sum + day.clicked, 0);

    return {
      deliveryRate: ((totalDelivered / totalSent) * 100).toFixed(1),
      openRate: ((totalOpened / totalDelivered) * 100).toFixed(1),
      clickRate: ((totalClicked / totalOpened) * 100).toFixed(1),
      totalCost: (totalSent * 0.05).toFixed(2)
    };
  };

  const metrics = calculateMetrics();

  const exportData = () => {
    const csvContent = [
      'Date,Sent,Delivered,Opened,Clicked,Delivery Rate,Open Rate,Click Rate',
      ...deliveryData.map(row => 
        `${row.date},${row.sent},${row.delivered},${row.opened},${row.clicked},${((row.delivered/row.sent)*100).toFixed(1)}%,${((row.opened/row.delivered)*100).toFixed(1)}%,${((row.clicked/row.opened)*100).toFixed(1)}%`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sms-analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-green-600">{metrics.deliveryRate}%</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">+2.1% vs last week</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.openRate}%</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-600">+1.3% vs last week</span>
                </div>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.clickRate}%</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingDown className="w-3 h-3 text-red-600" />
                  <span className="text-red-600">-0.5% vs last week</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-orange-600">${metrics.totalCost}</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-orange-600" />
                  <span className="text-orange-600">+5.2% vs last week</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Performance Trend</CardTitle>
              <CardDescription>Daily breakdown of message delivery metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={deliveryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="sent" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="delivered" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="opened" stackId="3" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Comparison</CardTitle>
              <CardDescription>Performance metrics by campaign type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaignPerformance.map((campaign, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <Badge variant="secondary">{campaign.ctr}% CTR</Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Sent</p>
                        <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Delivered</p>
                        <p className="font-medium">{campaign.delivered.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Opened</p>
                        <p className="font-medium">{campaign.opened.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Clicked</p>
                        <p className="font-medium">{campaign.clicked.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cost</p>
                        <p className="font-medium">${campaign.cost}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Message delivery by region</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={geographicData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#3B82F6" />
                  <Bar dataKey="delivered" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimal Send Times</CardTitle>
              <CardDescription>Performance by time of day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="delivered" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="opened" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="clicked" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Usage</CardTitle>
              <CardDescription>Message opens by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie
                      data={deviceTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {deviceTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {deviceTypes.map((type) => (
                    <div key={type.name} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-sm font-medium">{type.name}</span>
                      <Badge variant="secondary">{type.value}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
