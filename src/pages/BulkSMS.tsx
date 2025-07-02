
import React from 'react';
import { ClientDashboardLayout } from '../components/client/ClientDashboardLayout';
import { BulkSMS as BulkSMSComponent } from '../components/messaging/BulkSMS';

const BulkSMS = () => {
  return (
    <ClientDashboardLayout>
      <BulkSMSComponent />
    </ClientDashboardLayout>
  );
};

export default BulkSMS;
