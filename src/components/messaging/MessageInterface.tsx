
import React from 'react';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { MetricsGrid } from '../dashboard/MetricsGrid';
import { RecentActivity } from '../dashboard/RecentActivity';

export function MessageInterface() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Welcome back, Admin
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Monitor your enterprise communication platform performance with real-time insights and analytics across all channels.
          </p>
        </div>
        
        <MetricsGrid />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <RecentActivity />
          </div>
          
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-colors border border-blue-100">
                  <div className="font-medium text-blue-900">Create SMS Campaign</div>
                  <div className="text-sm text-blue-600">Launch bulk messaging</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors border border-green-100">
                  <div className="font-medium text-green-900">Send Email Blast</div>
                  <div className="text-sm text-green-600">Reach your audience</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 transition-colors border border-purple-100">
                  <div className="font-medium text-purple-900">Generate Report</div>
                  <div className="text-sm text-purple-600">Analytics & insights</div>
                </button>
              </div>
            </div>
            
            {/* System Status Panel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SMS Gateway</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Service</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">WhatsApp API</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-yellow-600">Maintenance</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">M-Pesa Integration</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-600">Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
