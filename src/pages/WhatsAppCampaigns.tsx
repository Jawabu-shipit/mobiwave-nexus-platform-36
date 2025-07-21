
import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { WhatsAppManager } from '../components/messaging/whatsapp/WhatsAppManager';

const WhatsAppCampaigns = () => {
  return (
    <DashboardLayout>
      <WhatsAppManager />
    </DashboardLayout>
  );
};

export default WhatsAppCampaigns;
