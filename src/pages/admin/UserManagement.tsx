
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { UserManagement as UserManagementComponent } from '../../components/admin/UserManagement';

const UserManagement = () => {
  return (
    <AdminDashboardLayout>
      <UserManagementComponent />
    </AdminDashboardLayout>
  );
};

export default UserManagement;
