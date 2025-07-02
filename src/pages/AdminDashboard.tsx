
import React from 'react';
import { AdminDashboardLayout } from '../components/admin/AdminDashboardLayout';
import { AdminDashboard as AdminDashboardComponent } from '../components/admin/AdminDashboard';

const AdminDashboard = () => {
  return (
    <AdminDashboardLayout>
      <AdminDashboardComponent />
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
