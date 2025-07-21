
import React from 'react';
import { ClientDashboardLayout } from '../components/client/ClientDashboardLayout';
import { UnifiedSurveyManager } from '../components/surveys/UnifiedSurveyManager';

const SurveyBuilder = () => {
  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent">
            Survey & Forms Builder
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Create interactive surveys and forms to collect feedback and data from your audience.
          </p>
        </div>
        <UnifiedSurveyManager />
      </div>
    </ClientDashboardLayout>
  );
};

export default SurveyBuilder;
