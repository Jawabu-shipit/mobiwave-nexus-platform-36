
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { UserCreationUtility } from '../../components/admin/UserCreationUtility';

const UserCreation = () => {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent">
            User Creation Utility
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Create new users with specific roles and credentials.
          </p>
        </div>
        
        <UserCreationUtility />
      </div>
    </AdminDashboardLayout>
  );
};

export default UserCreation;
