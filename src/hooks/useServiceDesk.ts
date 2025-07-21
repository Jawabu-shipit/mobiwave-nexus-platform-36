
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ServiceDeskTicket {
  id: string;
  subscription_id: string;
  ticket_number: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  assigned_to?: string;
  created_by: string;
  customer_phone?: string;
  customer_email?: string;
  sla_due_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketActivity {
  id: string;
  ticket_id: string;
  user_id: string;
  activity_type: 'comment' | 'status_change' | 'assignment' | 'priority_change';
  content?: string;
  metadata: any;
  created_at: string;
}

export const useServiceDesk = () => {
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['service-desk-tickets'],
    queryFn: async (): Promise<ServiceDeskTicket[]> => {
      const { data, error } = await supabase
        .from('service_desk_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching service desk tickets:', error);
        throw error;
      }

      // Type cast to ensure proper typing
      return (data || []).map(ticket => ({
        ...ticket,
        priority: ticket.priority as ServiceDeskTicket['priority'],
        status: ticket.status as ServiceDeskTicket['status']
      }));
    }
  });

  const createTicket = useMutation({
    mutationFn: async (ticketData: Omit<ServiceDeskTicket, 'id' | 'ticket_number' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create insert data object with only the fields we want to insert
      const insertData: any = {
        subscription_id: ticketData.subscription_id,
        title: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        status: ticketData.status,
        created_by: user.id
      };

      // Add optional fields only if they have values
      if (ticketData.assigned_to) insertData.assigned_to = ticketData.assigned_to;
      if (ticketData.customer_phone) insertData.customer_phone = ticketData.customer_phone;
      if (ticketData.customer_email) insertData.customer_email = ticketData.customer_email;
      if (ticketData.sla_due_at) insertData.sla_due_at = ticketData.sla_due_at;
      if (ticketData.resolved_at) insertData.resolved_at = ticketData.resolved_at;

      const { data, error } = await supabase
        .from('service_desk_tickets')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-desk-tickets'] });
      toast.success('Ticket created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create ticket: ${error.message}`);
    }
  });

  const updateTicket = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServiceDeskTicket> & { id: string }) => {
      const { data, error } = await supabase
        .from('service_desk_tickets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-desk-tickets'] });
      toast.success('Ticket updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update ticket: ${error.message}`);
    }
  });

  return {
    tickets,
    isLoading,
    createTicket: createTicket.mutateAsync,
    updateTicket: updateTicket.mutateAsync,
    isCreating: createTicket.isPending,
    isUpdating: updateTicket.isPending
  };
};

export const useTicketActivities = (ticketId?: string) => {
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['ticket-activities', ticketId],
    queryFn: async (): Promise<TicketActivity[]> => {
      if (!ticketId) return [];
      
      const { data, error } = await supabase
        .from('ticket_activities')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching ticket activities:', error);
        throw error;
      }

      // Type cast to ensure proper typing
      return (data || []).map(activity => ({
        ...activity,
        activity_type: activity.activity_type as TicketActivity['activity_type']
      }));
    },
    enabled: !!ticketId
  });

  const addActivity = useMutation({
    mutationFn: async (activityData: Omit<TicketActivity, 'id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ticket_activities')
        .insert({
          ticket_id: activityData.ticket_id,
          user_id: user.id,
          activity_type: activityData.activity_type,
          content: activityData.content,
          metadata: activityData.metadata
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-activities', ticketId] });
    },
    onError: (error: any) => {
      toast.error(`Failed to add activity: ${error.message}`);
    }
  });

  return {
    activities,
    isLoading,
    addActivity: addActivity.mutateAsync,
    isAdding: addActivity.isPending
  };
};
