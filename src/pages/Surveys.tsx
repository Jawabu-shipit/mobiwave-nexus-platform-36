
import React from 'react';
import { ClientDashboardLayout } from '../components/client/ClientDashboardLayout';
import { UnifiedSurveyManager } from '../components/surveys/UnifiedSurveyManager';

const Surveys = () => {
  return (
    <ClientDashboardLayout>
      <UnifiedSurveyManager />
    </ClientDashboardLayout>
  );
};

export default Surveys;
