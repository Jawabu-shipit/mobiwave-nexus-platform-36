import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Eye, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingSubscription {
  id: string;
  user_id: string;
  service_id: string;
  status: string;
  created_at: string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
  service: {
    service_name: string;
    service_type: string;
    description: string;
  };
}

export function PendingSubscriptionsManager() {
  const queryClient = useQueryClient();
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch pending subscriptions
  const { data: pendingSubscriptions = [], isLoading } = useQuery({
    queryKey: ['pending-subscriptions'],
    queryFn: async (): Promise<PendingSubscription[]> => {
      // Get pending subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('user_service_subscriptions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (subError) throw subError;
      if (!subscriptions || subscriptions.length === 0) return [];

      // Get user profiles
      const userIds = [...new Set(subscriptions.map(sub => sub.user_id).filter(Boolean))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Get service details
      const serviceIds = [...new Set(subscriptions.map(sub => sub.service_id).filter(Boolean))];
      const { data: services, error: servicesError } = await supabase
        .from('services_catalog')
        .select('id, service_name, service_type, description')
        .in('id', serviceIds);

      if (servicesError) throw servicesError;

      // Create maps for quick lookup
      const profilesMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);
      const servicesMap = new Map(services?.map(service => [service.id, service]) || []);

      // Transform the data
      const transformedData: PendingSubscription[] = subscriptions.map(subscription => {
        const profile = profilesMap.get(subscription.user_id);
        const service = servicesMap.get(subscription.service_id);
        
        return {
          ...subscription,
          user: {
            email: profile?.email || '',
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || ''
          },
          service: {
            service_name: service?.service_name || '',
            service_type: service?.service_type || '',
            description: service?.description || ''
          }
        };
      });

      return transformedData;
    }
  });

  const approveSubscription = useMutation({
    mutationFn: async ({ subscriptionId, adminNotes }: { subscriptionId: string; adminNotes?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Update the subscription status to active
      const { data, error } = await supabase
        .from('user_service_subscriptions')
        .update({
          status: 'active',
          activated_at: new Date().toISOString(),
          configuration: { 
            approved_by: user.user.id,
            admin_notes: adminNotes,
            approved_at: new Date().toISOString()
          }
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
      toast.success('Subscription approved and activated!');
      setSelectedSubscription(null);
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast.error(`Failed to approve subscription: ${error.message}`);
    }
  });

  const rejectSubscription = useMutation({
    mutationFn: async ({ subscriptionId, adminNotes }: { subscriptionId: string; adminNotes: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Update the subscription status to rejected
      const { data, error } = await supabase
        .from('user_service_subscriptions')
        .update({
          status: 'rejected',
          configuration: { 
            rejected_by: user.user.id,
            admin_notes: adminNotes,
            rejected_at: new Date().toISOString()
          }
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
      toast.success('Subscription rejected.');
      setSelectedSubscription(null);
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast.error(`Failed to reject subscription: ${error.message}`);
    }
  });

  const handleApprove = async (subscriptionId: string) => {
    try {
      await approveSubscription.mutateAsync({ subscriptionId, adminNotes });
    } catch (error) {
      console.error('Error approving subscription:', error);
    }
  };

  const handleReject = async (subscriptionId: string) => {
    if (!adminNotes.trim()) return;
    
    try {
      await rejectSubscription.mutateAsync({ subscriptionId, adminNotes });
    } catch (error) {
      console.error('Error rejecting subscription:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingSubscriptions.length}</div>
            <p className="text-sm text-gray-600">Pending Subscriptions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Service Subscriptions</CardTitle>
          <p className="text-sm text-gray-600">
            These are direct service subscriptions that need admin approval before activation.
          </p>
        </CardHeader>
        <CardContent>
          {pendingSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No pending subscriptions</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {subscription.user?.first_name} {subscription.user?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{subscription.user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.service?.service_name}</div>
                        <div className="text-sm text-gray-500 capitalize">
                          {subscription.service?.service_type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(subscription.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedSubscription(subscription);
                                setAdminNotes('');
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Service Subscription Review</DialogTitle>
                            </DialogHeader>
                            {selectedSubscription && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Requested Service</label>
                                    <p className="text-sm text-gray-600">
                                      {selectedSubscription.service?.service_name} ({selectedSubscription.service?.service_type})
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">User</label>
                                    <p className="text-sm text-gray-600">
                                      {selectedSubscription.user?.first_name} {selectedSubscription.user?.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500">{selectedSubscription.user?.email}</p>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Service Description</label>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">
                                    {selectedSubscription.service?.description}
                                  </p>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Admin Notes</label>
                                  <Textarea
                                    placeholder="Add notes about your decision..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                  />
                                </div>

                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={() => handleApprove(selectedSubscription.id)}
                                    disabled={approveSubscription.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve & Activate
                                  </Button>
                                  <Button
                                    onClick={() => handleReject(selectedSubscription.id)}
                                    disabled={rejectSubscription.isPending || !adminNotes.trim()}
                                    variant="destructive"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}