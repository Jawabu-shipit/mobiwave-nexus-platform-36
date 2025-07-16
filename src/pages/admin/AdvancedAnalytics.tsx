
import React from 'react';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { AdvancedAnalyticsHub } from '@/components/admin/analytics/AdvancedAnalyticsHub';

export default function AdvancedAnalytics() {
  return (
    <AdminDashboardLayout>
      <AdvancedAnalyticsHub />
    </AdminDashboardLayout>
  );
}
