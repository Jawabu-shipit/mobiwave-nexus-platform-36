
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { RevenueReports as RevenueReportsComponent } from '../../components/admin/RevenueReports';

const RevenueReports = () => {
  return (
    <AdminDashboardLayout>
      <RevenueReportsComponent />
    </AdminDashboardLayout>
  );
};

export default RevenueReports;
