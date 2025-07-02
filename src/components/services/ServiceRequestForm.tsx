
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServiceActivationRequests } from '@/hooks/useServiceActivationRequests';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface ServiceRequestFormProps {
  serviceId: string;
  serviceName: string;
  serviceType: string;
  onRequestSubmitted?: () => void;
}

export function ServiceRequestForm({ 
  serviceId, 
  serviceName, 
  serviceType,
  onRequestSubmitted 
}: ServiceRequestFormProps) {
  const [businessJustification, setBusinessJustification] = useState('');
  const [expectedUsage, setExpectedUsage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const { submitRequest, isSubmitting, userRequests } = useServiceActivationRequests();

  // Check if there's already a pending request for this service
  const existingRequest = userRequests.find(
    req => req.service_id === serviceId && req.status === 'pending'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessJustification.trim() || !expectedUsage.trim()) return;

    try {
      await submitRequest({
        serviceId,
        businessJustification: businessJustification.trim(),
        expectedUsage: expectedUsage.trim(),
        priority
      });
      
      setBusinessJustification('');
      setExpectedUsage('');
      setPriority('medium');
      onRequestSubmitted?.();
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  if (existingRequest) {
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
        case 'approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
        case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
        default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'text-yellow-800 bg-yellow-50 border-yellow-200';
        case 'approved': return 'text-green-800 bg-green-50 border-green-200';
        case 'rejected': return 'text-red-800 bg-red-50 border-red-200';
        default: return 'text-gray-800 bg-gray-50 border-gray-200';
      }
    };

    return (
      <Card className={`border-2 ${getStatusColor(existingRequest.status)}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            {getStatusIcon(existingRequest.status)}
            <div>
              <h3 className="font-semibold">Request {existingRequest.status.charAt(0).toUpperCase() + existingRequest.status.slice(1)}</h3>
              <p className="text-sm opacity-75">
                Submitted on {new Date(existingRequest.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {existingRequest.status === 'pending' && (
            <p className="text-sm">
              Your request for {serviceName} is being reviewed by our team. 
              You'll be notified once it's processed.
            </p>
          )}
          
          {existingRequest.status === 'approved' && (
            <p className="text-sm">
              Your request has been approved! The {serviceName} service should now be available in your dashboard.
            </p>
          )}
          
          {existingRequest.status === 'rejected' && existingRequest.admin_notes && (
            <div>
              <p className="text-sm mb-2">
                Your request was not approved. Reason:
              </p>
              <p className="text-sm bg-white/50 p-2 rounded border">
                {existingRequest.admin_notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Access to {serviceName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="business-justification">Business Justification *</Label>
            <Textarea
              id="business-justification"
              placeholder="Explain how this service will benefit your business..."
              value={businessJustification}
              onChange={(e) => setBusinessJustification(e.target.value)}
              className="mt-1"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="expected-usage">Expected Usage *</Label>
            <Textarea
              id="expected-usage"
              placeholder="Describe your expected usage patterns, volume, etc..."
              value={expectedUsage}
              onChange={(e) => setExpectedUsage(e.target.value)}
              className="mt-1"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Can wait</SelectItem>
                <SelectItem value="medium">Medium - Normal timeline</SelectItem>
                <SelectItem value="high">High - Urgent need</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !businessJustification.trim() || !expectedUsage.trim()}
          >
            {isSubmitting ? 'Submitting Request...' : 'Submit Access Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
