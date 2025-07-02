
import React from 'react';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { SecurityDashboard } from '@/components/admin/security/SecurityDashboard';

export default function SecurityCenter() {
  return (
    <AdminDashboardLayout>
      <SecurityDashboard />
    </AdminDashboardLayout>
  );
}
