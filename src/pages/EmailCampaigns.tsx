
import React from 'react';
import { ClientDashboardLayout } from '../components/client/ClientDashboardLayout';
import { EmailCampaignManager } from '../components/messaging/email/EmailCampaignManager';

const EmailCampaigns = () => {
  return (
    <ClientDashboardLayout>
      <EmailCampaignManager />
    </ClientDashboardLayout>
  );
};

export default EmailCampaigns;
