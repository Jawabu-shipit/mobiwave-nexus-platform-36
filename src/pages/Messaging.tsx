
import React from 'react';
import { ClientDashboardLayout } from '../components/client/ClientDashboardLayout';

const Messaging = () => {
  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent">
            Messaging
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Send and manage your SMS campaigns and communications.
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Messaging functionality coming soon...</p>
        </div>
      </div>
    </ClientDashboardLayout>
  );
};

export default Messaging;
