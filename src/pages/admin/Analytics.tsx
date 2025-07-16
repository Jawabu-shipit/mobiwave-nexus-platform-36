
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { Analytics as AnalyticsComponent } from '../../components/admin/Analytics';

const Analytics = () => {
  return (
    <AdminDashboardLayout>
      <AnalyticsComponent />
    </AdminDashboardLayout>
  );
};

export default Analytics;
