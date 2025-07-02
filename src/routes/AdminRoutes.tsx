
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '@/pages/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import UserCreation from '@/pages/admin/UserCreation';
import ServicesManagement from '@/pages/admin/ServicesManagement';
import Analytics from '@/pages/admin/Analytics';
import EnhancedAnalytics from '@/pages/admin/EnhancedAnalytics';
import AdvancedAnalytics from '@/pages/admin/AdvancedAnalytics';
import Monitoring from '@/pages/admin/Monitoring';
import RealTimeMonitoring from '@/pages/admin/RealTimeMonitoring';
import SecurityConfig from '@/pages/admin/SecurityConfig';
import AdvancedSecurityCenter from '@/pages/admin/AdvancedSecurityCenter';
import SystemSettings from '@/pages/admin/SystemSettings';
import SystemHealth from '@/pages/admin/SystemHealth';
import SystemDiagnostics from '@/pages/admin/SystemDiagnostics';
import SystemIntegrity from '@/pages/admin/SystemIntegrity';
import DatabaseAdmin from '@/pages/admin/DatabaseAdmin';
import SystemLogs from '@/pages/admin/SystemLogs';
import ApiManagement from '@/pages/ApiManagement';
import RevenueReports from '@/pages/admin/RevenueReports';
import ProjectProgress from '@/pages/admin/ProjectProgress';
import NotificationCenter from '@/pages/admin/NotificationCenter';

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/users/create" element={<UserCreation />} />
      <Route path="/services" element={<ServicesManagement />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/analytics/enhanced" element={<EnhancedAnalytics />} />
      <Route path="/analytics/advanced" element={<AdvancedAnalytics />} />
      <Route path="/monitoring" element={<Monitoring />} />
      <Route path="/monitoring/realtime" element={<RealTimeMonitoring />} />
      <Route path="/security" element={<SecurityConfig />} />
      <Route path="/security/advanced" element={<AdvancedSecurityCenter />} />
      <Route path="/settings" element={<SystemSettings />} />
      <Route path="/system/health" element={<SystemHealth />} />
      <Route path="/system/diagnostics" element={<SystemDiagnostics />} />
      <Route path="/system/integrity" element={<SystemIntegrity />} />
      <Route path="/database" element={<DatabaseAdmin />} />
      <Route path="/logs" element={<SystemLogs />} />
      <Route path="/api" element={<ApiManagement />} />
      <Route path="/revenue" element={<RevenueReports />} />
      <Route path="/project" element={<ProjectProgress />} />
      <Route path="/notifications" element={<NotificationCenter />} />
    </Routes>
  );
}
