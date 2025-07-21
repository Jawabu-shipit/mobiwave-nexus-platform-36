
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactsManager } from './ContactsManager';
import { ContactGroupsManager } from './ContactGroupsManager';
import { ContactImportExport } from './ContactImportExport';
import { ContactDuplicateDetector } from './ContactDuplicateDetector';
import { EnhancedContactsBulkActions } from './EnhancedContactsBulkActions';
import { Users, Upload, Search, UserPlus } from 'lucide-react';
import { useContactsData } from '@/hooks/contacts/useContactsData';
import { useContactMutations } from '@/hooks/contacts/useContactMutations';
import { useContactGroupOperations } from '@/hooks/contacts/useContactGroupOperations';

export function EnhancedContactsManager() {
  const { data: contactsData = [], refetch } = useContactsData();
  const { importContacts, mergeContacts } = useContactMutations();
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const { 
    addContactToGroup, 
    bulkAddContactsToGroup, 
    moveContactsBetweenGroups,
    bulkRemoveContactsFromGroup 
  } = useContactGroupOperations();

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Contacts Management</h1>
        <p className="text-gray-600">
          Manage your contacts, organize them into groups, and import/export data efficiently.
        </p>
      </div>

      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="import-export" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import/Export
          </TabsTrigger>
          <TabsTrigger value="duplicates" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Find Duplicates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <EnhancedContactsBulkActions 
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
      </Tabs>
    </div>
  );
}
