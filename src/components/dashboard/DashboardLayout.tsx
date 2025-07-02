
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ClientSidebar } from '../client/ClientSidebar';
import { DashboardTopBar } from './DashboardTopBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// This is now a generic layout that defaults to client dashboard
// Individual pages should use ClientDashboardLayout or AdminDashboardLayout instead
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <ClientSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardTopBar />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
