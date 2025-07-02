
import React from 'react';
import { ClientDashboardLayout } from '../components/client/ClientDashboardLayout';

const Settings = () => {
  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent">
            Settings
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Configure your personal settings and preferences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
            <p className="text-gray-600">
              Manage your account preferences and personal information.
            </p>
            <div className="mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Update Profile
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Notification Settings</h3>
            <p className="text-gray-600">
              Configure how you receive notifications and alerts.
            </p>
            <div className="mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Configure Notifications
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>Note:</strong> API credentials and system-wide settings are managed by administrators. 
            Contact your system administrator if you need to configure API integrations.
          </p>
        </div>
      </div>
    </ClientDashboardLayout>
  );
};

export default Settings;
