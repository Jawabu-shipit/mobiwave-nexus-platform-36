import React from 'react';
import { ClientDashboardLayout } from '../components/client/ClientDashboardLayout';
import { EnhancedBillingDashboard } from '../components/billing/EnhancedBillingDashboard';

const Billing = () => {
  return (
    <ClientDashboardLayout>
      <EnhancedBillingDashboard />
    </ClientDashboardLayout>
  );
};

export default Billing;
