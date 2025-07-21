
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, CreditCard, Download, Calendar } from 'lucide-react';
import { CurrencyKES } from '@/components/ui/CurrencyKES';

export function RevenueReports() {
  const revenueData = [
    { month: 'Jan', revenue: 45000, costs: 28000, profit: 17000 },
    { month: 'Feb', revenue: 52000, costs: 31000, profit: 21000 },
    { month: 'Mar', revenue: 48000, costs: 29000, profit: 19000 },
    { month: 'Apr', revenue: 61000, costs: 35000, profit: 26000 },
    { month: 'May', revenue: 58000, costs: 33000, profit: 25000 },
  ];

  const subscriptions = [
    { plan: 'Basic', subscribers: 423, revenue: 8460, growth: '+12%' },
    { plan: 'Pro', subscribers: 189, revenue: 18900, growth: '+8%' },
    { plan: 'Enterprise', subscribers: 34, revenue: 33200, growth: '+15%' },
  ];

  const transactions = [
    { id: 'TXN-001', user: 'john@example.com', amount: 99, plan: 'Pro', date: '2024-01-15', status: 'completed' },
    { id: 'TXN-002', user: 'jane@example.com', amount: 19, plan: 'Basic', date: '2024-01-15', status: 'completed' },
    { id: 'TXN-003', user: 'bob@example.com', amount: 999, plan: 'Enterprise', date: '2024-01-14', status: 'pending' },
    { id: 'TXN-004', user: 'alice@example.com', amount: 99, plan: 'Pro', date: '2024-01-14', status: 'completed' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-yellow-900 via-yellow-800 to-yellow-700 bg-clip-text text-transparent">
          Revenue Reports
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Comprehensive financial analytics, subscription metrics, and revenue tracking.
        </p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">$264K</p>
                <p className="text-sm text-green-600 font-medium">+18.5% this month</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <CurrencyKES className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Monthly Growth</p>
                <p className="text-3xl font-bold text-gray-900">+12.4%</p>
                <p className="text-sm text-green-600 font-medium">vs last month</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Subs</p>
                <p className="text-3xl font-bold text-gray-900">646</p>
                <p className="text-sm text-green-600 font-medium">+5.2% this month</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">ARPU</p>
                <p className="text-3xl font-bold text-gray-900">$89</p>
                <p className="text-sm text-green-600 font-medium">+2.8% this month</p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Revenue Trend
            </CardTitle>
            <CardDescription>
              Monthly revenue, costs, and profit analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} name="Revenue" />
                <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={3} name="Profit" />
                <Line type="monotone" dataKey="costs" stroke="#EF4444" strokeWidth={3} name="Costs" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              Subscription Plans
            </CardTitle>
            <CardDescription>
              Revenue breakdown by subscription tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subscriptions} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="plan" type="category" />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Metrics */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Subscription Metrics
          </CardTitle>
          <CardDescription>
            Detailed breakdown of subscription performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptions.map((sub) => (
              <div key={sub.plan} className="p-4 rounded-lg bg-gray-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{sub.plan}</h3>
                  <Badge className="bg-blue-100 text-blue-800">{sub.growth}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subscribers</span>
                    <span className="font-medium">{sub.subscribers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-medium">${sub.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg per User</span>
                    <span className="font-medium">${Math.round(sub.revenue / sub.subscribers)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CurrencyKES className="w-5 h-5 text-green-600" />
                Recent Transactions
              </CardTitle>
              <CardDescription>
                Latest payment transactions and subscription updates
              </CardDescription>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-medium">{txn.id}</TableCell>
                  <TableCell>{txn.user}</TableCell>
                  <TableCell>{txn.plan}</TableCell>
                  <TableCell>${txn.amount}</TableCell>
                  <TableCell>{txn.date}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(txn.status)}>
                      {txn.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
