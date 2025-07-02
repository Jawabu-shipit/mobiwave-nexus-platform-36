
import { useMemo, useState } from 'react';

interface Service {
  id: string;
  service_name: string;
  service_type: string;
}

interface Subscription {
  id: string;
  user_id: string;
  service_id: string;
  status: string;
  service: Service;
}

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export const useServiceFilters = (subscriptions: Subscription[], users: User[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');

  const availableStatuses = useMemo(() => {
    const statuses = new Set(subscriptions.map(sub => sub.status));
    return Array.from(statuses);
  }, [subscriptions]);

  const availableServiceTypes = useMemo(() => {
    const types = new Set(subscriptions.map(sub => sub.service.service_type));
    return Array.from(types);
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(subscription => {
      const user = users.find(u => u.id === subscription.user_id);
      const userDisplayName = user ? `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase() : '';
      const serviceDisplayName = subscription.service.service_name.toLowerCase();

      const matchesSearch = searchTerm === '' || 
        userDisplayName.includes(searchTerm.toLowerCase()) ||
        serviceDisplayName.includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
      const matchesServiceType = serviceTypeFilter === 'all' || subscription.service.service_type === serviceTypeFilter;

      return matchesSearch && matchesStatus && matchesServiceType;
    });
  }, [subscriptions, users, searchTerm, statusFilter, serviceTypeFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    serviceTypeFilter,
    setServiceTypeFilter,
    filteredSubscriptions,
    availableStatuses,
    availableServiceTypes
  };
};
