
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Eye,
  MessageSquare,
  Users,
  Zap
} from 'lucide-react';
import { useCampaignTracking } from '@/hooks/useCampaignTracking';
import { Spinner } from '@/components/ui/spinner';

export function DeliveryTrackerEnhanced() {
  const {
    campaigns,
    selectedCampaignId,
    setSelectedCampaignId,
    autoRefresh,
    setAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    isLoading
  } = useCampaignTracking();

  // Filter campaigns based on selection
  const filteredCampaigns = selectedCampaignId === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.id === selectedCampaignId);

  // Calculate overall stats
  const totalStats = campaigns.reduce((acc, campaign) => ({
    totalRecipients: acc.totalRecipients + campaign.totalRecipients,
    sent: acc.sent + campaign.sent,
    delivered: acc.delivered + campaign.delivered,
    failed: acc.failed + campaign.failed,
    pending: acc.pending + campaign.pending
  }), { totalRecipients: 0, sent: 0, delivered: 0, failed: 0, pending: 0 });

  const overallDeliveryRate = totalStats.sent > 0 ? (totalStats.delivered / totalStats.sent) * 100 : 0;

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'sending': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (campaign: typeof campaigns[0]) => {
    return (campaign.sent / (campaign.totalRecipients || 1)) * 100;
  };

  const calculateDeliveryRate = (campaign: typeof campaigns[0]) => {
    if (campaign.sent === 0) return 0;
    return (campaign.delivered / campaign.sent) * 100;
  };

  const formatTimeRemaining = (estimatedCompletion?: Date) => {
    if (!estimatedCompletion) return 'N/A';
    const remaining = estimatedCompletion.getTime() - Date.now();
    if (remaining <= 0) return 'Completed';
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Delivery Tracking</h2>
          <p className="text-gray-600">Real-time monitoring of campaign delivery status</p>
        </div>
        <div className="flex gap-2">
          <Select 
            value={refreshInterval.toString()} 
            onValueChange={(value) => setRefreshInterval(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="300">5 minutes</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-6 text-center">
          <Spinner className="mx-auto" />
          <p className="mt-2 text-gray-500">Loading campaign data...</p>
        </Card>
      ) : (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Recipients</p>
                    <p className="text-xl font-bold">{totalStats.totalRecipients.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Sent</p>
                    <p className="text-xl font-bold">{totalStats.sent.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Delivered</p>
                    <p className="text-xl font-bold">{totalStats.delivered.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-xl font-bold">{totalStats.failed.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Delivery Rate</p>
                    <p className="text-xl font-bold">{overallDeliveryRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Filter by Campaign:</label>
                <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    {campaigns.map(campaign => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Status Cards */}
          <div className="space-y-4">
            {filteredCampaigns.map(campaign => (
              <Card key={campaign.id} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(campaign.status)}
                      <div>
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <CardDescription>
                          Started {campaign.startTime.toLocaleTimeString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{calculateProgress(campaign).toFixed(1)}%</span>
                      </div>
                      <Progress value={calculateProgress(campaign)} className="h-3" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-600">Total</p>
                        <p className="font-bold">{campaign.totalRecipients.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-blue-600">Sent</p>
                        <p className="font-bold text-blue-800">{campaign.sent.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-green-600">Delivered</p>
                        <p className="font-bold text-green-800">{campaign.delivered.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <p className="text-red-600">Failed</p>
                        <p className="font-bold text-red-800">{campaign.failed.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <p className="text-yellow-600">Pending</p>
                        <p className="font-bold text-yellow-800">{campaign.pending.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <p className="text-purple-600">Rate</p>
                        <p className="font-bold text-purple-800">{calculateDeliveryRate(campaign).toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <div className="flex gap-4">
                        {campaign.status === 'sending' && (
                          <span>Time remaining: {formatTimeRemaining(campaign.estimatedCompletion)}</span>
                        )}
                        <span>Delivery rate: {calculateDeliveryRate(campaign).toFixed(1)}%</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCampaigns.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active delivery campaigns</p>
                <p className="text-sm text-gray-400">Start a campaign to see real-time delivery tracking</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
