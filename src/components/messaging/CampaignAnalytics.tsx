import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  MessageSquare, 
  Users, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function CampaignAnalytics() {
  const { campaigns, getCampaignStats } = useCampaigns();
  const stats = getCampaignStats();

  // Prepare data for charts
  const campaignTypeData = React.useMemo(() => {
    if (!campaigns) return [];
    
    const typeCount = campaigns.reduce((acc: any, campaign) => {
      const type = campaign.type || 'sms';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(typeCount).map(([type, count]) => ({
      name: type.toUpperCase(),
      value: count
    }));
  }, [campaigns]);

  const deliveryData = React.useMemo(() => {
    if (!campaigns) return [];
    
    return campaigns.slice(0, 10).map(campaign => ({
      name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name,
      sent: campaign.sent_count || 0,
      delivered: campaign.delivered_count || 0,
      failed: campaign.failed_count || 0
    }));
  }, [campaigns]);

  const monthlyData = React.useMemo(() => {
    if (!campaigns) return [];
    
    const monthlyStats = campaigns.reduce((acc: any, campaign) => {
      const month = new Date(campaign.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (!acc[month]) {
        acc[month] = { month, campaigns: 0, messages: 0, cost: 0 };
      }
      
      acc[month].campaigns += 1;
      acc[month].messages += campaign.sent_count || 0;
      acc[month].cost += Number(campaign.cost) || 0;
      
      return acc;
    }, {});

    return Object.values(monthlyStats).slice(-6); // Last 6 months
  }, [campaigns]);

  const totalCost = campaigns?.reduce((sum, c) => sum + (Number(c.cost) || 0), 0) || 0;
  const avgDeliveryRate = stats.totalDelivered > 0 ? 
    Math.round((stats.totalDelivered / (campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 1)) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Badge variant="secondary" className="text-xs">
                {stats.activeCampaigns} active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                <p className="text-2xl font-bold">
                  {campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{avgDeliveryRate}% delivery rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold">{stats.totalDelivered}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <span>
                {campaigns?.reduce((sum, c) => sum + (c.failed_count || 0), 0) || 0} failed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <span>
                ${campaigns?.length ? (totalCost / campaigns.length).toFixed(2) : '0.00'} avg per campaign
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Types */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={campaignTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {campaignTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="campaigns" 
                  stroke="#8884d8" 
                  name="Campaigns"
                />
                <Line 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="#82ca9d" 
                  name="Messages"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Delivery Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={deliveryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sent" fill="#8884d8" name="Sent" />
              <Bar dataKey="delivered" fill="#82ca9d" name="Delivered" />
              <Bar dataKey="failed" fill="#ff7c7c" name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}