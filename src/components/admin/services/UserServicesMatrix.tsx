
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from 'lucide-react';
import { useUserServicesOverview } from '@/hooks/useUserServicesOverview';
import { BulkOperationsPanel } from './matrix/BulkOperationsPanel';
import { ServicesMatrixTable } from './matrix/ServicesMatrixTable';
import { MatrixLoadingState } from './matrix/MatrixLoadingState';

export function UserServicesMatrix() {
  const { groupedByUser, isLoading, toggleService, bulkServiceOperation, isUpdating } = useUserServicesOverview();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(groupedByUser.map((item: any) => item.user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkOperation = async (operation: 'activate' | 'deactivate') => {
    if (!selectedService || selectedUsers.length === 0) {
      return;
    }

    try {
      await bulkServiceOperation({
        userIds: selectedUsers,
        serviceId: selectedService,
        operation
      });
      setSelectedUsers([]);
    } catch (error) {
      console.error('Bulk operation failed:', error);
    }
  };

  const handleToggleService = async (params: { userId: string; serviceId: string; operation: 'activate' | 'deactivate' }) => {
    try {
      await toggleService(params);
    } catch (error) {
      console.error('Service toggle failed:', error);
    }
  };

  // Get all unique services for the service selector
  const allServices = groupedByUser.length > 0 
    ? groupedByUser[0].services || []
    : [];

  if (isLoading) {
    return <MatrixLoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Bulk Operations Panel */}
      {selectedUsers.length > 0 && (
        <BulkOperationsPanel
          selectedUsers={selectedUsers}
          selectedService={selectedService}
          allServices={allServices}
          isUpdating={isUpdating}
          onServiceChange={setSelectedService}
          onBulkOperation={handleBulkOperation}
          onClearSelection={() => setSelectedUsers([])}
        />
      )}

      {/* Main Users & Services Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users & Services Matrix
            <Badge variant="outline" className="ml-2">
              {groupedByUser.length} users
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ServicesMatrixTable
            groupedByUser={groupedByUser}
            allServices={allServices}
            selectedUsers={selectedUsers}
            isUpdating={isUpdating}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            onToggleService={handleToggleService}
          />
        </CardContent>
      </Card>
    </div>
  );
}
