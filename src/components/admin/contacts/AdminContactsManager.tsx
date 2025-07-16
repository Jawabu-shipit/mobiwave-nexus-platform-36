import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, FileText, Shield } from 'lucide-react';
import { ContactsManager } from '@/components/contacts/ContactsManager';
import { ContactImportExport } from '@/components/contacts/ContactImportExport';
import { ContactDuplicateDetector } from '@/components/contacts/ContactDuplicateDetector';
import { AdminContactsBulkActions } from '@/components/admin/users/AdminContactsBulkActions';
import { useContactsData } from '@/hooks/contacts/useContactsData';
import { useContactMutations } from '@/hooks/contacts/useContactMutations';
import { useAdminContactOperations } from '@/hooks/useAdminContactOperations';
import { ContactGroupsManager } from '@/components/contacts/ContactGroupsManager';
 
export function AdminContactsManager() {
  const { data: contactsData = [], refetch } = useContactsData();
  const { importContacts, mergeContacts } = useContactMutations();
  const { bulkValidateContacts } = useAdminContactOperations();
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);

  const handleImportContacts = async (contactsData: any[]) => {
    try {
      await importContacts(contactsData);
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  };

  const handleMergeContacts = async (keepContact: any, duplicateIds: string[]) => {
    try {
      await mergeContacts({ keepContact, duplicateIds });
    } catch (error) {
      console.error('Merge failed:', error);
      throw error;
    }
  };

  const handleValidateContacts = async () => {
    if (selectedContacts.length === 0) return;
    
    try {
      const contactIds = selectedContacts.map(c => c.id);
      await bulkValidateContacts(contactIds, 'all');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold tracking-tight">Admin Contact Management</h1>
        </div>
        <p className="text-gray-600">
          Advanced contact management with admin privileges for bulk operations and system-wide contact oversight.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            All Contacts
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Contact Groups
          </TabsTrigger>
          <TabsTrigger value="import-export" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Import/Export
          </TabsTrigger>
          <TabsTrigger value="duplicates" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Duplicates
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Validation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Contacts</p>
                    <p className="text-3xl font-bold text-gray-900">{contactsData.length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-50">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Active Contacts</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {contactsData.filter(c => c.is_active).length}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-50">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Inactive Contacts</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {contactsData.filter(c => !c.is_active).length}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-red-50">
                    <Users className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">With Email</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {contactsData.filter(c => c.email).length}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-50">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <AdminContactsBulkActions 
            selectedContacts={selectedContacts}
            onClearSelection={() => setSelectedContacts([])}
            onRefresh={refetch}
          />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <AdminContactsBulkActions
            selectedContacts={selectedContacts}
            onClearSelection={() => setSelectedContacts([])}
            onRefresh={refetch}
          />
          <ContactsManager />
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <ContactGroupsManager />
        </TabsContent>
 
        <TabsContent value="import-export" className="space-y-4">
          <ContactImportExport
            contacts={contactsData}
            onImport={handleImportContacts}
          />
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-4">
          <ContactDuplicateDetector 
            contacts={contactsData}
            onMergeContacts={handleMergeContacts}
          />
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Contact Validation Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Validate contact information including phone numbers and email addresses.
                  Select contacts to validate using the bulk actions above.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Phone Validation</h4>
                    <p className="text-sm text-gray-600">
                      Validates Kenyan phone number formats and standardizes them.
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Email Validation</h4>
                    <p className="text-sm text-gray-600">
                      Checks email format and structure for validity.
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Complete Validation</h4>
                    <p className="text-sm text-gray-600">
                      Runs both phone and email validation on selected contacts.
                    </p>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}