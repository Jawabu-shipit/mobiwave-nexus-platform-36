
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  DollarSign,
  Settings,
  BarChart3,
  Activity
} from 'lucide-react';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { useCampaigns } from '@/hooks/useCampaigns';
import { RealTimeDashboard } from '../dashboard/RealTimeDashboard';

export function AdminDashboard() {
  const { data: systemMetrics, isLoading: systemLoading } = useSystemMetrics();
  const { data: userAnalytics, isLoading: userLoading } = useUserAnalytics();
  const { campaigns, getCampaignStats } = useCampaigns();

  const campaignStats = getCampaignStats();

  if (systemLoading || userLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent">
          Admin Dashboard
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Monitor system performance, manage users, and track key metrics.
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{userAnalytics?.totalUsers || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+{userAnalytics?.newUsersThisMonth || 0} this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{campaignStats.activeCampaigns}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <Activity className="w-4 h-4 mr-1" />
              <span>{campaignStats.totalCampaigns} total campaigns</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">System Health</p>
                <p className="text-3xl font-bold text-gray-900">{systemMetrics?.systemHealth || 'Unknown'}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{systemMetrics?.uptime || '99.9%'} uptime</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Messages Delivered</p>
                <p className="text-3xl font-bold text-gray-900">{campaignStats.totalDelivered.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{campaignStats.deliveryRate.toFixed(1)}% delivery rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userAnalytics?.usersByRole && Object.entries(userAnalytics.usersByRole).map(([role, count]) => (
                    <div key={role} className="flex justify-between items-center">
                      <span className="capitalize">{role}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Total Messages</span>
                    <span className="font-semibold">{systemMetrics?.totalMessages || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Response Time</span>
                    <span className="font-semibold">{systemMetrics?.responseTime || 0}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Campaigns</span>
                    <span className="font-semibold">{systemMetrics?.activeCampaigns || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime">
          <RealTimeDashboard />
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">User Analytics</h3>
              <p className="text-gray-600">
                Detailed user analytics available in the User Management section.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardContent className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Campaign Analytics</h3>
              <p className="text-gray-600">
                Detailed campaign analytics available in the Analytics section.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
