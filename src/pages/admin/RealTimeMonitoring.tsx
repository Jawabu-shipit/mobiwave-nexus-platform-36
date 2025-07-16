
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { RealTimeMonitoringDashboard } from '../../components/admin/monitoring/RealTimeMonitoringDashboard';

const RealTimeMonitoring = () => {
  return (
    <AdminDashboardLayout>
      <RealTimeMonitoringDashboard />
    </AdminDashboardLayout>
  );
};

export default RealTimeMonitoring;
