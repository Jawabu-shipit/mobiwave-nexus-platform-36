
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from 'lucide-react';
import { useServiceDesk } from '@/hooks/useServiceDesk';
import { toast } from 'sonner';

interface TicketManagerProps {
  onBack: () => void;
}

export function TicketManager({ onBack }: TicketManagerProps) {
  const [ticketData, setTicketData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    customer_phone: '',
    customer_email: '',
    subscription_id: '' // This would come from user's service desk subscription
  });

  const { createTicket, isCreating } = useServiceDesk();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketData.title || !ticketData.description) {
      toast.error('Please fill in title and description');
      return;
    }

    // Mock subscription_id for demo - in real app this would come from user's active service desk subscription
    const mockSubscriptionId = '550e8400-e29b-41d4-a716-446655440000';

    try {
      await createTicket({
        ...ticketData,
        subscription_id: mockSubscriptionId,
        status: 'open',
        created_by: 'current-user' // This would be the actual user ID
      });
      onBack();
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Create Support Ticket</h2>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>New Ticket</CardTitle>
          <CardDescription>Create a new support ticket for customer issues</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={ticketData.title}
                onChange={(e) => setTicketData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={ticketData.description}
                onChange={(e) => setTicketData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the issue"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={ticketData.priority} 
                  onValueChange={(value) => setTicketData(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_phone">Customer Phone</Label>
                <Input
                  id="customer_phone"
                  value={ticketData.customer_phone}
                  onChange={(e) => setTicketData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  placeholder="+254712345678"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_email">Customer Email</Label>
              <Input
                id="customer_email"
                type="email"
                value={ticketData.customer_email}
                onChange={(e) => setTicketData(prev => ({ ...prev, customer_email: e.target.value }))}
                placeholder="customer@example.com"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isCreating}>
                <Save className="w-4 h-4 mr-2" />
                {isCreating ? 'Creating...' : 'Create Ticket'}
              </Button>
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
