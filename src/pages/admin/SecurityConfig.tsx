
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import SecurityConfig from '../../components/admin/SecurityConfig';

const SecurityConfigPage = () => {
  return (
    <AdminDashboardLayout>
      <SecurityConfig />
    </AdminDashboardLayout>
  );
};

export default SecurityConfigPage;
