
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { AdvancedSecurityCenter as AdvancedSecurityCenterComponent } from '../../components/admin/monitoring/AdvancedSecurityCenter';

const AdvancedSecurityCenter = () => {
  return (
    <AdminDashboardLayout>
      <AdvancedSecurityCenterComponent />
    </AdminDashboardLayout>
  );
};

export default AdvancedSecurityCenter;
