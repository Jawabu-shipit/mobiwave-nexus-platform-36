
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Play, Pause, Trash2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScheduledCampaign {
  id: string;
  campaign_id: string;
  scheduled_for: string;
  status: string;
  error_message?: string;
  processed_at?: string;
  created_at: string;
  campaigns?: {
    name: string;
    message: string;
    recipient_count: number;
  };
}

export function ScheduledCampaignsManager() {
  const [isLoading, setIsLoading] = useState(false);

  const { data: scheduledCampaigns, isLoading: isLoadingCampaigns, refetch } = useQuery({
    queryKey: ['scheduled-campaigns'],
    queryFn: async (): Promise<ScheduledCampaign[]> => {
      const { data, error } = await supabase
        .from('scheduled_campaigns')
        .select(`
          *,
          campaigns (
            name,
            message,
            recipient_count
          )
        `)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000,
  });

  const handleCancelScheduled = async (campaignId: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled campaign?')) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('scheduled_campaigns')
        .update({ status: 'cancelled' })
        .eq('id', campaignId);

      if (error) throw error;

      toast.success('Scheduled campaign cancelled successfully');
      refetch();
    } catch (error: any) {
      toast.error(`Failed to cancel campaign: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = async (campaignId: string) => {
    // This would open a rescheduling dialog
    toast.info('Rescheduling feature coming soon');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge variant="default">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-gray-500">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoadingCampaigns) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scheduled Campaigns</h2>
          <p className="text-gray-600">Manage your scheduled SMS campaigns</p>
        </div>
        <Button onClick={() => refetch()}>
          <Clock className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming & Past Campaigns</CardTitle>
          <CardDescription>
            View and manage all your scheduled campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledCampaigns && scheduledCampaigns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Scheduled For</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{campaign.campaigns?.name || 'Untitled Campaign'}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {campaign.campaigns?.message}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {campaign.campaigns?.recipient_count || 0} recipients
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(campaign.scheduled_for).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(campaign.scheduled_for).toLocaleTimeString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(campaign.status)}
                      {campaign.error_message && (
                        <div className="text-xs text-red-600 mt-1">
                          {campaign.error_message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {campaign.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReschedule(campaign.id)}
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelScheduled(campaign.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {campaign.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReschedule(campaign.id)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No scheduled campaigns found</p>
              <p className="text-sm text-gray-400">Create a scheduled campaign to see it here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
