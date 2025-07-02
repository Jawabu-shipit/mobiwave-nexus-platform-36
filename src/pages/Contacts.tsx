
import React from 'react';
import { ClientDashboardLayout } from '../components/client/ClientDashboardLayout';
import { EnhancedContactsManager } from '../components/contacts/EnhancedContactsManager';

const Contacts = () => {
  return (
    <ClientDashboardLayout>
      <EnhancedContactsManager />
    </ClientDashboardLayout>
  );
};

export default Contacts;
