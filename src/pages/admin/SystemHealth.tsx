
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { SystemHealthDashboard } from '../../components/admin/monitoring/SystemHealthDashboard';

const SystemHealth = () => {
  return (
    <AdminDashboardLayout>
      <SystemHealthDashboard />
    </AdminDashboardLayout>
  );
};

export default SystemHealth;
