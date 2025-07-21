import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Clock, AlertCircle, CheckCircle, User } from 'lucide-react';
import { useServiceDesk } from '@/hooks/useServiceDesk';
import { TicketManager } from './TicketManager';
import { TicketDetails } from './TicketDetails';

export function ServiceDeskDashboard() {
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'details'>('dashboard');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { tickets, isLoading } = useServiceDesk();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  if (activeView === 'create') {
    return <TicketManager onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'details' && selectedTicket) {
    return (
      <TicketDetails 
        ticketId={selectedTicket} 
        onBack={() => {
          setActiveView('dashboard');
          setSelectedTicket(null);
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Service Desk</h2>
          <p className="text-gray-600">Manage customer support tickets and requests</p>
        </div>
        <Button onClick={() => setActiveView('create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Open Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets}</div>
            <p className="text-xs text-gray-600">Awaiting response</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTickets}</div>
            <p className="text-xs text-gray-600">Being worked on</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTickets}</div>
            <p className="text-xs text-gray-600">Waiting for info</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedTickets}</div>
            <p className="text-xs text-gray-600">Recently resolved</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>Manage and track customer support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search tickets by title or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No tickets match your search' : 'No support tickets created yet'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setActiveView('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Ticket
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedTicket(ticket.id);
                    setActiveView('details');
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-gray-600">{ticket.ticket_number}</span>
                      <h3 className="font-medium">{ticket.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {ticket.customer_phone && (
                      <span>📞 {ticket.customer_phone}</span>
                    )}
                    {ticket.customer_email && (
                      <span>✉️ {ticket.customer_email}</span>
                    )}
                    <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
