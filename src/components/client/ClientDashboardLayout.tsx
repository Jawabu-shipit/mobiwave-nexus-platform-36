
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ClientSidebar } from './ClientSidebar';
import { DashboardTopBar } from '../dashboard/DashboardTopBar';

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
}

export function ClientDashboardLayout({ children }: ClientDashboardLayoutProps) {
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
