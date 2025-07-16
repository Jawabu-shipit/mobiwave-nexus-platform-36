
import React from 'react';
import { AdminDashboardLayout } from '../components/admin/AdminDashboardLayout';
import { AdvancedAnalyticsDashboard } from '../components/analytics/AdvancedAnalyticsDashboard';

const AdvancedAnalytics = () => {
  return (
    <AdminDashboardLayout>
      <AdvancedAnalyticsDashboard />
    </AdminDashboardLayout>
  );
};

export default AdvancedAnalytics;
