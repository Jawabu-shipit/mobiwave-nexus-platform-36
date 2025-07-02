
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { SystemAnalyticsDashboard } from '../../components/admin/analytics/SystemAnalyticsDashboard';

const EnhancedAnalytics = () => {
  return (
    <AdminDashboardLayout>
      <SystemAnalyticsDashboard />
    </AdminDashboardLayout>
  );
};

export default EnhancedAnalytics;
