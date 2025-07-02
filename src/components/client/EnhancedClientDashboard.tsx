
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  CreditCard, 
  Mail, 
  Phone,
  TrendingUp,
  Calendar,
  Bell,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceStatusWidget } from './ServiceStatusWidget';

export function EnhancedClientDashboard() {
  const navigate = useNavigate();

  // Mock data - in a real app, this would come from your API
  const stats = {
    totalCampaigns: 24,
    totalContacts: 1247,
    creditsRemaining: 850.50,
    thisMonthSpent: 149.25
  };

  const recentActivity = [
    { id: 1, type: 'sms', action: 'Campaign sent', target: '245 contacts', time: '2 hours ago' },
    { id: 2, type: 'contact', action: 'Contacts imported', target: '89 new contacts', time: '1 day ago' },
    { id: 3, type: 'payment', action: 'Credits purchased', target: '500 credits', time: '3 days ago' },
  ];

  const quickActions = [
    { 
      title: 'Send SMS Campaign', 
      description: 'Create and send bulk SMS messages',
      icon: MessageSquare,
      action: () => navigate('/messaging/sms'),
      color: 'bg-blue-500'
    },
    { 
      title: 'Manage Contacts', 
      description: 'Add, edit, and organize contacts',
      icon: Users,
      action: () => navigate('/contacts'),
      color: 'bg-green-500'
    },
    { 
      title: 'View Analytics', 
      description: 'Track campaign performance',
      icon: BarChart3,
      action: () => navigate('/analytics'),
      color: 'bg-purple-500'
    },
    { 
      title: 'Buy Credits', 
      description: 'Purchase messaging credits',
      icon: CreditCard,
      action: () => navigate('/billing'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Welcome back! Here's what's happening with your messaging platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCampaigns}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Contacts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalContacts.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+89 this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Credits Remaining</p>
                <p className="text-3xl font-bold text-gray-900">${stats.creditsRemaining}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/billing')}>
                Buy More
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">This Month Spent</p>
                <p className="text-3xl font-bold text-gray-900">${stats.thisMonthSpent}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Updated daily</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Status Widget */}
        <ServiceStatusWidget />

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 justify-start hover:shadow-md transition-shadow"
                    onClick={action.action}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-2 rounded-md ${action.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs text-gray-500">{action.description}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/analytics')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  {activity.type === 'sms' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'contact' && <Users className="w-4 h-4 text-green-600" />}
                  {activity.type === 'payment' && <CreditCard className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{activity.action}</div>
                  <div className="text-xs text-gray-500">{activity.target}</div>
                </div>
                <div className="text-xs text-gray-400">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
