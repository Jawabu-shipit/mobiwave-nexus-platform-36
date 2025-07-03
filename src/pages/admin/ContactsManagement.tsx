import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { AdminContactsManager } from '../../components/admin/contacts/AdminContactsManager';

const ContactsManagement = () => {
  return (
    <AdminDashboardLayout>
      <AdminContactsManager />
    </AdminDashboardLayout>
  );
};

export default ContactsManagement;