
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { SystemDiagnostics as SystemDiagnosticsComponent } from '../../components/admin/monitoring/SystemDiagnostics';

const SystemDiagnostics = () => {
  return (
    <AdminDashboardLayout>
      <SystemDiagnosticsComponent />
    </AdminDashboardLayout>
  );
};

export default SystemDiagnostics;
