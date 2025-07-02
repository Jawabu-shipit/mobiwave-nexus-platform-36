
import React from 'react';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { AdvancedIntegrationsHub } from '@/components/admin/integrations/AdvancedIntegrationsHub';

export default function AdvancedIntegrations() {
  return (
    <AdminDashboardLayout>
      <AdvancedIntegrationsHub />
    </AdminDashboardLayout>
  );
}
