
import React from 'react';
import { ClientDashboardLayout } from '@/components/client/ClientDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ServiceRequests = () => {
  const { user } = useAuth();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['service-activation-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('service_activation_requests')
        .select(`
          id,
          status,
          priority,
          business_justification,
          expected_usage,
          admin_notes,
          created_at,
          processed_at,
          services_catalog!inner(
            service_name,
            service_type,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <ClientDashboardLayout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
            <p className="text-gray-600">Track your service activation requests</p>
          </div>
          <Button onClick={() => window.location.href = '/my-services'}>
            Browse Services
          </Button>
        </div>

        {requests && requests.length > 0 ? (
          <div className="grid gap-4">
            {requests.map((request: any) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <CardTitle className="text-lg">
                          {request.services_catalog?.service_name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {request.services_catalog?.service_type} Service
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority} priority
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">{request.services_catalog?.description}</p>
                    
                    {request.business_justification && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Business Justification</h4>
                        <p className="text-sm text-gray-600">{request.business_justification}</p>
                      </div>
                    )}
                    
                    {request.expected_usage && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Expected Usage</h4>
                        <p className="text-sm text-gray-600">{request.expected_usage}</p>
                      </div>
                    )}
                    
                    {request.admin_notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Admin Notes</h4>
                        <p className="text-sm text-gray-600">{request.admin_notes}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                      {request.processed_at && (
                        <span>Processed: {new Date(request.processed_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Requests</h3>
              <p className="text-gray-600 mb-4">You haven't submitted any service activation requests yet.</p>
              <Button onClick={() => window.location.href = '/my-services'}>Browse Services</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ClientDashboardLayout>
  );
};

export default ServiceRequests;
