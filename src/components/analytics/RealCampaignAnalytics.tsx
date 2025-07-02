
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, MessageSquare, Users, DollarSign, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function RealCampaignAnalytics() {
  const { campaigns, isLoading: campaignsLoading } = useCampaigns();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedCampaignType, setSelectedCampaignType] = useState('all');

  // Fetch audit logs as a substitute for message history
  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['audit-logs-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching audit logs:', error);
        return [];
      }
      return data || [];
    }
  });

  // Fetch user credits for cost analysis
  const { data: userCredits } = useQuery({
    queryKey: ['user-credits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*');

      if (error) {
        console.warn('Error fetching user credits:', error);
        return [];
      }
      return data || [];
    }
  });

  if (campaignsLoading || logsLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  // Filter campaigns based on timeframe and type
  const now = new Date();
  const timeframeDays = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90;
  const startDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);

  const filteredCampaigns = (campaigns || []).filter(campaign => {
    const campaignDate = new Date(campaign.created_at);
    const isInTimeframe = campaignDate >= startDate;
    const isCorrectType = selectedCampaignType === 'all' || campaign.type === selectedCampaignType;
    return isInTimeframe && isCorrectType;
  });

  // Calculate metrics from campaign data
  const totalCampaigns = filteredCampaigns.length;
  const totalMessages = filteredCampaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
  const successfulMessages = filteredCampaigns.reduce((sum, c) => sum + (c.delivered_count || 0), 0);
  const failedMessages = filteredCampaigns.reduce((sum, c) => sum + (c.failed_count || 0), 0);
  const pendingMessages = totalMessages - successfulMessages - failedMessages;
  const totalCost = filteredCampaigns.reduce((sum, c) => sum + (Number(c.cost) || 0), 0);
  const deliveryRate = totalMessages > 0 ? (successfulMessages / totalMessages) * 100 : 0;

  // Campaign status distribution
  const campaignStatusData = [
    { name: 'Sent', value: filteredCampaigns.filter(c => c.status === 'sent').length, color: '#00C49F' },
    { name: 'Sending', value: filteredCampaigns.filter(c => c.status === 'sending').length, color: '#0088FE' },
    { name: 'Draft', value: filteredCampaigns.filter(c => c.status === 'draft').length, color: '#FFBB28' },
    { name: 'Failed', value: filteredCampaigns.filter(c => c.status === 'failed').length, color: '#FF8042' },
  ].filter(item => item.value > 0);

  // Daily campaign volume based on campaign creation dates
  const dailyData = Array.from({ length: timeframeDays }, (_, i) => {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayCampaigns = filteredCampaigns.filter(c => {
      const campaignDate = new Date(c.created_at);
      return campaignDate.toDateString() === date.toDateString();
    });
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      messages: dayCampaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0),
      delivered: dayCampaigns.reduce((sum, c) => sum + (c.delivered_count || 0), 0),
      failed: dayCampaigns.reduce((sum, c) => sum + (c.failed_count || 0), 0),
      cost: dayCampaigns.reduce((sum, c) => sum + (Number(c.cost) || 0), 0)
    };
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCampaignType} onValueChange={setSelectedCampaignType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{totalCampaigns}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Messages Sent</p>
                <p className="text-3xl font-bold text-gray-900">{totalMessages.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Delivery Rate</p>
                <p className="text-3xl font-bold text-gray-900">{deliveryRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Cost</p>
                <p className="text-3xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Message Volume */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Daily Message Volume</CardTitle>
            <CardDescription>Messages sent over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="delivered" fill="#00C49F" name="Delivered" />
                <Bar dataKey="failed" fill="#FF8042" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Status Distribution */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Campaign Status</CardTitle>
            <CardDescription>Distribution of campaign statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={campaignStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {campaignStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance Table */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Detailed performance metrics for recent campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Messages Sent</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Delivery Rate</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.slice(0, 10).map((campaign) => {
                const delivered = campaign.delivered_count || 0;
                const total = campaign.sent_count || 0;
                const rate = total > 0 ? (delivered / total) * 100 : 0;
                const cost = Number(campaign.cost) || 0;

                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'sent': return 'bg-green-100 text-green-800';
                    case 'sending': return 'bg-blue-100 text-blue-800';
                    case 'draft': return 'bg-yellow-100 text-yellow-800';
                    case 'failed': return 'bg-red-100 text-red-800';
                    default: return 'bg-gray-100 text-gray-800';
                  }
                };

                return (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {campaign.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{total.toLocaleString()}</TableCell>
                    <TableCell>{delivered.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{rate.toFixed(1)}%</span>
                        {rate >= 90 ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : rate >= 70 ? (
                          <Clock className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>${cost.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Message Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{successfulMessages.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {totalMessages > 0 ? ((successfulMessages / totalMessages) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedMessages.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {totalMessages > 0 ? ((failedMessages / totalMessages) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-50">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingMessages.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {totalMessages > 0 ? ((pendingMessages / totalMessages) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
