
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Users, Merge, AlertTriangle, Check } from 'lucide-react';
import { Contact } from '@/hooks/contacts/useContactsData';

interface ContactDuplicateDetectorProps {
  contacts: Contact[];
  onMergeContacts: (keepContact: Contact, duplicateIds: string[]) => Promise<any>;
}

interface DuplicateGroup {
  id: string;
  contacts: Contact[];
  duplicateField: string;
  value: string;
}

export function ContactDuplicateDetector({ contacts, onMergeContacts }: ContactDuplicateDetectorProps) {
  const [selectedDuplicates, setSelectedDuplicates] = useState<string[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  const duplicateGroups = useMemo(() => {
    const phoneGroups = new Map<string, Contact[]>();
    const emailGroups = new Map<string, Contact[]>();

    // Group by phone
    contacts.forEach(contact => {
      if (contact.phone) {
        const normalizedPhone = contact.phone.replace(/\s+/g, '');
        if (!phoneGroups.has(normalizedPhone)) {
          phoneGroups.set(normalizedPhone, []);
        }
        phoneGroups.get(normalizedPhone)!.push(contact);
      }
    });

    // Group by email
    contacts.forEach(contact => {
      if (contact.email) {
        const normalizedEmail = contact.email.toLowerCase().trim();
        if (!emailGroups.has(normalizedEmail)) {
          emailGroups.set(normalizedEmail, []);
        }
        emailGroups.get(normalizedEmail)!.push(contact);
      }
    });

    const duplicates: DuplicateGroup[] = [];

    // Find phone duplicates
    phoneGroups.forEach((groupContacts, phone) => {
      if (groupContacts.length > 1) {
        duplicates.push({
          id: `phone-${phone}`,
          contacts: groupContacts,
          duplicateField: 'phone',
          value: phone
        });
      }
    });

    // Find email duplicates
    emailGroups.forEach((groupContacts, email) => {
      if (groupContacts.length > 1) {
        duplicates.push({
          id: `email-${email}`,
          contacts: groupContacts,
          duplicateField: 'email',
          value: email
        });
      }
    });

    return duplicates;
  }, [contacts]);

  const handleMergeGroup = async (group: DuplicateGroup, keepContactId: string) => {
    setIsMerging(true);
    try {
      const keepContact = group.contacts.find(c => c.id === keepContactId);
      if (!keepContact) return;

      const duplicateIds = group.contacts
        .filter(c => c.id !== keepContactId)
        .map(c => c.id);

      await onMergeContacts(keepContact, duplicateIds);
      setSelectedDuplicates(prev => prev.filter(id => id !== group.id));
      toast.success(`Merged ${duplicateIds.length} duplicate contacts`);
    } catch (error) {
      console.error('Merge error:', error);
      toast.error('Failed to merge contacts');
    } finally {
      setIsMerging(false);
    }
  };

  if (duplicateGroups.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Duplicate Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="p-3 rounded-full bg-green-50 w-fit mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-900 mb-2">
              No Duplicates Found
            </h3>
            <p className="text-green-700">
              Your contact database is clean! No duplicate phone numbers or emails detected.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Duplicate Detection
          </span>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {duplicateGroups.length} groups found
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-700">
              <strong>Found {duplicateGroups.length} duplicate groups</strong> affecting{' '}
              {duplicateGroups.reduce((sum, group) => sum + group.contacts.length, 0)} contacts.
              Review and merge duplicates to clean up your database.
            </p>
          </div>

          <div className="space-y-3">
            {duplicateGroups.map((group) => (
              <DuplicateGroupCard
                key={group.id}
                group={group}
                onMerge={handleMergeGroup}
                isMerging={isMerging}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DuplicateGroupCardProps {
  group: DuplicateGroup;
  onMerge: (group: DuplicateGroup, keepContactId: string) => Promise<void>;
  isMerging: boolean;
}

function DuplicateGroupCard({ group, onMerge, isMerging }: DuplicateGroupCardProps) {
  const [selectedKeepId, setSelectedKeepId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMerge = async () => {
    if (!selectedKeepId) {
      toast.error('Please select a contact to keep');
      return;
    }
    
    await onMerge(group, selectedKeepId);
    setIsDialogOpen(false);
    setSelectedKeepId('');
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge className={group.duplicateField === 'phone' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
            {group.duplicateField}: {group.value}
          </Badge>
          <span className="text-sm text-gray-500">
            {group.contacts.length} contacts
          </span>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Merge className="w-4 h-4 mr-2" />
              Merge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Merge Duplicate Contacts</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select which contact to keep. The others will be deleted.
              </p>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Keep</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <input
                          type="radio"
                          name="keepContact"
                          value={contact.id}
                          checked={selectedKeepId === contact.id}
                          onChange={(e) => setSelectedKeepId(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                      </TableCell>
                      <TableCell>
                        {contact.first_name || contact.last_name 
                          ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                          : 'No Name'
                        }
                      </TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.email || '-'}</TableCell>
                      <TableCell>
                        {new Date(contact.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleMerge} disabled={!selectedKeepId || isMerging}>
                  {isMerging ? 'Merging...' : 'Merge Contacts'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {group.contacts.map((contact) => (
          <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
            <div className="flex items-center gap-3">
              <span className="font-medium">
                {contact.first_name || contact.last_name 
                  ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                  : 'No Name'
                }
              </span>
              <span className="text-gray-500">{contact.phone}</span>
              {contact.email && <span className="text-gray-500">{contact.email}</span>}
            </div>
            <span className="text-xs text-gray-400">
              {new Date(contact.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
