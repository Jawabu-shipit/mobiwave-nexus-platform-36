
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { SystemLogs as SystemLogsComponent } from '../../components/admin/SystemLogs';

const SystemLogs = () => {
  return (
    <AdminDashboardLayout>
      <SystemLogsComponent />
    </AdminDashboardLayout>
  );
};

export default SystemLogs;
