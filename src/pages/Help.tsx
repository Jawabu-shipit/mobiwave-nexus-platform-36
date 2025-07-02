import React, { useState } from 'react';
import { ClientDashboardLayout } from '@/components/client/ClientDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle,
  Search,
  Plus,
  ExternalLink
} from 'lucide-react';

const Help = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  // Fetch user's support tickets
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['support-tickets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('service_desk_tickets')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Create new ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: typeof newTicket) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Create the insert data with proper field mapping including ticket_number
      const insertData = {
        ticket_number: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate a unique ticket number
        title: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        status: 'open',
        created_by: user.id,
        customer_email: user.email || ''
      };

      const { data, error } = await supabase
        .from('service_desk_tickets')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Ticket Created",
        description: "Your support ticket has been created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setNewTicket({ title: '', description: '', priority: 'medium' });
      setShowNewTicketForm(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive"
      });
      console.error('Error creating ticket:', error);
    }
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.title.trim() || !newTicket.description.trim()) return;
    createTicketMutation.mutate(newTicket);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
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

  const faqItems = [
    {
      question: "How do I activate a new service?",
      answer: "Go to 'My Services' and click on the service you want to activate. Fill out the activation request form with your business details."
    },
    {
      question: "How are credits deducted for SMS campaigns?",
      answer: "Credits are deducted based on the number of messages sent. Each SMS typically costs 0.30-0.60 KES depending on your volume."
    },
    {
      question: "How long does USSD service activation take?",
      answer: "USSD services require regulatory approval and typically take 2-3 weeks to activate after submission."
    },
    {
      question: "Can I integrate with my existing systems?",
      answer: "Yes, we provide REST APIs for all our services. Check the API documentation in your dashboard."
    }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "+254 700 123 456",
      availability: "Mon-Fri 8AM-6PM"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "support@mobiwave.co.ke",
      availability: "24/7 - Response within 24hrs"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Available in dashboard",
      availability: "Mon-Fri 8AM-6PM"
    }
  ];

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
            <p className="text-gray-600">Get help with your account and services</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactMethods.map((method, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <method.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{method.title}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                    <p className="text-xs text-gray-500">{method.availability}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Support Tickets */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>My Support Tickets</CardTitle>
              <Button 
                onClick={() => setShowNewTicketForm(!showNewTicketForm)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showNewTicketForm && (
              <form onSubmit={handleCreateTicket} className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-4">
                <Input
                  placeholder="Ticket Title"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Describe your issue..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  required
                  rows={4}
                />
                <div className="flex items-center space-x-4">
                  <select 
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={createTicketMutation.isPending}>
                      {createTicketMutation.isPending ? 'Creating...' : 'Create Ticket'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowNewTicketForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {ticketsLoading ? (
              <div className="text-center py-4">Loading tickets...</div>
            ) : tickets && tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((ticket: any) => (
                  <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{ticket.title}</h4>
                      <div className="flex space-x-2">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                    <div className="text-xs text-gray-500">
                      Ticket #{ticket.ticket_number} • Created {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No support tickets yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <h4 className="font-medium mb-2">{faq.question}</h4>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documentation Links */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation & Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start h-auto p-4">
                <ExternalLink className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">API Documentation</div>
                  <div className="text-sm text-gray-500">Integration guides and references</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <ExternalLink className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Service Setup Guides</div>
                  <div className="text-sm text-gray-500">Step-by-step activation guides</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientDashboardLayout>
  );
};

export default Help;
