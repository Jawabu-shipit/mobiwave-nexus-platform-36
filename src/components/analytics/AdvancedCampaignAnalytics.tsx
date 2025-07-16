
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Users, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';

interface ConversionMetrics {
  campaignId: string;
  campaignName: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  conversionRate: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

interface ABTestResult {
  testName: string;
  variantA: {
    name: string;
    sent: number;
    converted: number;
    conversionRate: number;
  };
  variantB: {
    name: string;
    sent: number;
    converted: number;
    conversionRate: number;
  };
  winner: 'A' | 'B' | 'tie';
  confidence: number;
}

export function AdvancedCampaignAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('conversion');
  const { campaigns } = useCampaigns();

  // Mock conversion data (in production, this would come from actual tracking)
  const conversionMetrics: ConversionMetrics[] = campaigns?.map(campaign => ({
    campaignId: campaign.id,
    campaignName: campaign.name,
    sent: campaign.sent_count || 0,
    delivered: campaign.delivered_count || 0,
    opened: Math.floor((campaign.delivered_count || 0) * (0.6 + Math.random() * 0.3)),
    clicked: Math.floor((campaign.delivered_count || 0) * (0.1 + Math.random() * 0.2)),
    converted: Math.floor((campaign.delivered_count || 0) * (0.02 + Math.random() * 0.08)),
    conversionRate: 2 + Math.random() * 8,
    deliveryRate: campaign.delivered_count && campaign.sent_count ? 
      (campaign.delivered_count / campaign.sent_count) * 100 : 0,
    openRate: 60 + Math.random() * 30,
    clickRate: 10 + Math.random() * 20
  })) || [];

  // Mock A/B test results
  const abTestResults: ABTestResult[] = [
    {
      testName: 'Welcome Message Variants',
      variantA: { name: 'Short Message', sent: 500, converted: 25, conversionRate: 5.0 },
      variantB: { name: 'Detailed Message', sent: 500, converted: 35, conversionRate: 7.0 },
      winner: 'B',
      confidence: 95
    },
    {
      testName: 'Call-to-Action Buttons',
      variantA: { name: 'Shop Now', sent: 750, converted: 60, conversionRate: 8.0 },
      variantB: { name: 'Learn More', sent: 750, converted: 45, conversionRate: 6.0 },
      winner: 'A',
      confidence: 87
    }
  ];

  const timeSeriesData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      conversions: Math.floor(Math.random() * 100) + 20,
      deliveries: Math.floor(Math.random() * 1000) + 500,
      opens: Math.floor(Math.random() * 800) + 300,
      clicks: Math.floor(Math.random() * 200) + 50
    };
  });

  const conversionFunnelData = [
    { stage: 'Sent', count: 10000, color: '#3B82F6' },
    { stage: 'Delivered', count: 9500, color: '#10B981' },
    { stage: 'Opened', count: 6000, color: '#F59E0B' },
    { stage: 'Clicked', count: 1200, color: '#EF4444' },
    { stage: 'Converted', count: 250, color: '#8B5CF6' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Campaign Analytics</h2>
          <p className="text-gray-600">Deep insights into campaign performance and user behavior</p>
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
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conversion">Conversions</SelectItem>
              <SelectItem value="delivery">Deliveries</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="abtesting">A/B Testing</TabsTrigger>
          <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Conversion Rate</p>
                    <p className="text-2xl font-bold">
                      {(conversionMetrics.reduce((sum, m) => sum + m.conversionRate, 0) / Math.max(conversionMetrics.length, 1)).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Conversions</p>
                    <p className="text-2xl font-bold">
                      {conversionMetrics.reduce((sum, m) => sum + m.converted, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Open Rate</p>
                    <p className="text-2xl font-bold">
                      {(conversionMetrics.reduce((sum, m) => sum + m.openRate, 0) / Math.max(conversionMetrics.length, 1)).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Click Rate</p>
                    <p className="text-2xl font-bold">
                      {(conversionMetrics.reduce((sum, m) => sum + m.clickRate, 0) / Math.max(conversionMetrics.length, 1)).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="conversions" stroke="#8B5CF6" strokeWidth={2} />
                  <Line type="monotone" dataKey="clicks" stroke="#EF4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="opens" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Conversion Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionMetrics.map((metric) => (
                  <div key={metric.campaignId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{metric.campaignName}</h4>
                      <Badge variant={metric.conversionRate > 5 ? "default" : "secondary"}>
                        {metric.conversionRate.toFixed(1)}% conversion
                      </Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Sent</p>
                        <p className="font-semibold">{metric.sent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Delivered</p>
                        <p className="font-semibold">{metric.delivered.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Opened</p>
                        <p className="font-semibold">{metric.opened.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Clicked</p>
                        <p className="font-semibold">{metric.clicked.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Converted</p>
                        <p className="font-semibold">{metric.converted.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abtesting">
          <div className="space-y-4">
            {abTestResults.map((test, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {test.testName}
                    <Badge variant={test.confidence > 90 ? "default" : "secondary"}>
                      {test.confidence}% confidence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Variant A: {test.variantA.name}</h4>
                        {test.winner === 'A' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Sent:</span>
                          <span>{test.variantA.sent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Converted:</span>
                          <span>{test.variantA.converted}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Conversion Rate:</span>
                          <span>{test.variantA.conversionRate}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Variant B: {test.variantB.name}</h4>
                        {test.winner === 'B' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Sent:</span>
                          <span>{test.variantB.sent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Converted:</span>
                          <span>{test.variantB.converted}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Conversion Rate:</span>
                          <span>{test.variantB.conversionRate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={conversionFunnelData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="stage" type="category" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {conversionFunnelData.map((stage, index) => {
                    const previousStage = index > 0 ? conversionFunnelData[index - 1] : null;
                    const dropoffRate = previousStage ? 
                      ((previousStage.count - stage.count) / previousStage.count * 100) : 0;
                    
                    return (
                      <div key={stage.stage} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: stage.color }}
                          ></div>
                          <span className="font-medium">{stage.stage}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{stage.count.toLocaleString()}</div>
                          {index > 0 && (
                            <div className="text-sm text-red-600">
                              -{dropoffRate.toFixed(1)}% dropout
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
