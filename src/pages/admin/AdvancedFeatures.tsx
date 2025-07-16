
import React from 'react';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { AdvancedFeaturesHub } from '@/components/admin/advanced/AdvancedFeaturesHub';

export default function AdvancedFeatures() {
  return (
    <AdminDashboardLayout>
      <AdvancedFeaturesHub />
    </AdminDashboardLayout>
  );
}
