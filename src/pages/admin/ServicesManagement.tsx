
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { ServicesManagement as ServicesManagementComponent } from '../../components/admin/ServicesManagement';

const ServicesManagement = () => {
  return (
    <AdminDashboardLayout>
      <ServicesManagementComponent />
    </AdminDashboardLayout>
  );
};

export default ServicesManagement;
