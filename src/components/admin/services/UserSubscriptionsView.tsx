
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from 'lucide-react';
import { SubscriptionTableRow } from './SubscriptionTableRow';
import { SubscriptionFilters } from './SubscriptionFilters';
import { ServiceLoadingWrapper } from './ServiceLoadingWrapper';
import { useServiceFilters } from '@/hooks/useServiceFilters';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface UserServiceSubscription {
  id: string;
  user_id: string;
  service_id: string;
  status: string;
  activated_at: string;
  configuration: any;
  setup_fee_paid: boolean;
  monthly_billing_active: boolean;
  service: {
    id: string;
    service_name: string;
    service_type: string;
  };
}

interface UserSubscriptionsViewProps {
  userSubscriptions: UserServiceSubscription[];
  users: User[];
  isLoading: boolean;
  isUpdating: boolean;
  onToggleServiceStatus: (subscriptionId: string, newStatus: string) => Promise<void>;
}

export function UserSubscriptionsView({ 
  userSubscriptions, 
  users, 
  isLoading, 
  isUpdating,
  onToggleServiceStatus 
}: UserSubscriptionsViewProps) {
  // Transform userSubscriptions for the useServiceFilters hook, filtering out any undefined/null values
  const subscriptionsForFiltering = userSubscriptions
    .filter(subscription => subscription && subscription.id && subscription.service)
    .map(subscription => ({
      id: subscription.id,
      user_id: subscription.user_id,
      service_id: subscription.service_id,
      status: subscription.status,
      service: {
        id: subscription.service.id,
        service_name: subscription.service.service_name,
        service_type: subscription.service.service_type
      }
    }));

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    serviceTypeFilter,
    setServiceTypeFilter,
    filteredSubscriptions,
    availableStatuses,
    availableServiceTypes
  } = useServiceFilters(subscriptionsForFiltering, users);

  // Map filtered results back to full subscription objects, ensuring they exist
  const filteredFullSubscriptions = filteredSubscriptions
    .map(filtered => userSubscriptions.find(sub => sub && sub.id === filtered.id))
    .filter(Boolean) as UserServiceSubscription[];

  return (
    <ServiceLoadingWrapper isLoading={isLoading}>
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            User Service Subscriptions
          </CardTitle>
          <SubscriptionFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            serviceTypeFilter={serviceTypeFilter}
            setServiceTypeFilter={setServiceTypeFilter}
            availableStatuses={availableStatuses}
            availableServiceTypes={availableServiceTypes}
          />
        </CardHeader>
        <CardContent>
          {filteredFullSubscriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No subscriptions found matching your filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Activated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFullSubscriptions.map((subscription) => (
                  <SubscriptionTableRow
                    key={subscription.id}
                    subscription={subscription}
                    user={users.find(u => u.id === subscription.user_id)}
                    isUpdating={isUpdating}
                    onToggleServiceStatus={onToggleServiceStatus}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </ServiceLoadingWrapper>
  );
}
