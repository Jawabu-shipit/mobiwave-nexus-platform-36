
import React from 'react';
import { AdminDashboardLayout } from '../components/admin/AdminDashboardLayout';
import { ApiManagement as ApiManagementComponent } from '../components/api/ApiManagement';

const ApiManagement = () => {
  return (
    <AdminDashboardLayout>
      <ApiManagementComponent />
    </AdminDashboardLayout>
  );
};

export default ApiManagement;
