
import React from 'react';
import { ClientDashboardLayout } from '../components/client/ClientDashboardLayout';
import { USSDApplicationBuilder } from '../components/services/ussd/USSDApplicationBuilder';

const USSDServices = () => {
  return (
    <ClientDashboardLayout>
      <USSDApplicationBuilder />
    </ClientDashboardLayout>
  );
};

export default USSDServices;
