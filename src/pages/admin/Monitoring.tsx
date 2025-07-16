
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { Monitoring as MonitoringComponent } from '../../components/admin/Monitoring';

const Monitoring = () => {
  return (
    <AdminDashboardLayout>
      <MonitoringComponent />
    </AdminDashboardLayout>
  );
};

export default Monitoring;
