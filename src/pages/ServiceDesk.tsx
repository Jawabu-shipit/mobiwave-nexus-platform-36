
import React from 'react';
import { ClientDashboardLayout } from '../components/client/ClientDashboardLayout';
import { ServiceDeskDashboard } from '../components/servicedesk/ServiceDeskDashboard';

const ServiceDesk = () => {
  return (
    <ClientDashboardLayout>
      <ServiceDeskDashboard />
    </ClientDashboardLayout>
  );
};

export default ServiceDesk;
