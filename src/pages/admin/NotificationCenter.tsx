
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { AdvancedNotificationSystem } from '../../components/admin/notifications/AdvancedNotificationSystem';

const NotificationCenter = () => {
  return (
    <AdminDashboardLayout>
      <AdvancedNotificationSystem />
    </AdminDashboardLayout>
  );
};

export default NotificationCenter;
