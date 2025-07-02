
import React from 'react';
import { ClientDashboardLayout } from '../components/client/ClientDashboardLayout';
import { MpesaIntegrationManager } from '../components/services/mpesa/MpesaIntegrationManager';

const MpesaServices = () => {
  return (
    <ClientDashboardLayout>
      <MpesaIntegrationManager />
    </ClientDashboardLayout>
  );
};

export default MpesaServices;
