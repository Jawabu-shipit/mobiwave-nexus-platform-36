
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { SystemSettings as SystemSettingsComponent } from '../../components/admin/SystemSettings';

const SystemSettings = () => {
  return (
    <AdminDashboardLayout>
      <SystemSettingsComponent />
    </AdminDashboardLayout>
  );
};

export default SystemSettings;
