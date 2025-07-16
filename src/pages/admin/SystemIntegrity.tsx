
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { SystemIntegrityDashboard } from '../../components/admin/SystemIntegrityDashboard';

const SystemIntegrity = () => {
  return (
    <AdminDashboardLayout>
      <SystemIntegrityDashboard />
    </AdminDashboardLayout>
  );
};

export default SystemIntegrity;
