import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactsManager } from '../contacts/ContactsManager';
import { ContactGroupsManager } from '../contacts/ContactGroupsManager';

export function Contacts() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="all-contacts">
        <TabsList>
          <TabsTrigger value="all-contacts">All Contacts</TabsTrigger>
          <TabsTrigger value="contact-groups">Contact Groups</TabsTrigger>
        </TabsList>
        <TabsContent value="all-contacts">
          <ContactsManager />
        </TabsContent>
        <TabsContent value="contact-groups">
          <ContactGroupsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}