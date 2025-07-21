
import React from 'react';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { PerformanceOptimizationHub } from '@/components/admin/performance/PerformanceOptimizationHub';

export default function PerformanceOptimization() {
  return (
    <AdminDashboardLayout>
      <PerformanceOptimizationHub />
    </AdminDashboardLayout>
  );
}
