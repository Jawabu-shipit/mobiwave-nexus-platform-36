
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { DatabaseAdmin as DatabaseAdminComponent } from '../../components/admin/DatabaseAdmin';

const DatabaseAdmin = () => {
  return (
    <AdminDashboardLayout>
      <DatabaseAdminComponent />
    </AdminDashboardLayout>
  );
};

export default DatabaseAdmin;
