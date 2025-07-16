
import React from 'react';
import { ClientDashboardLayout } from '@/components/client/ClientDashboardLayout';
import { PlanManagement as PlanManagementComponent } from '@/components/client/PlanManagement';

const PlanManagement = () => {
  return (
    <ClientDashboardLayout>
      <PlanManagementComponent />
    </ClientDashboardLayout>
  );
};

export default PlanManagement;
