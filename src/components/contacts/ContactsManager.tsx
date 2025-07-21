import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, Search, Edit, Trash2, Upload, Download, Send, UserCheck, UserX, Move } from 'lucide-react';
import { useContactsData } from '@/hooks/contacts/useContactsData';
import { useContactMutations } from '@/hooks/contacts/useContactMutations';
import { useContactGroups } from '@/hooks/contacts/useContactGroups';
import { CustomTagsInput } from './CustomTagsInput';
import { ContactActionsDialog } from './ContactActionsDialog';
import { toast } from 'sonner';

export function ContactsManager() {
  const { data: contacts = [], isLoading, refetch } = useContactsData();
  const { createContact, updateContact, deleteContact, importContacts } = useContactMutations();
  const { contactGroups } = useContactGroups();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [isActionsDialogOpen, setIsActionsDialogOpen] = useState(false);
  const [currentActionType, setCurrentActionType] = useState<'activate' | 'deactivate' | 'message' | 'move' | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    tags: [] as string[],
    custom_fields: {},
    is_active: true
  });

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: ''
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && contact.is_active) ||
      (statusFilter === 'inactive' && !contact.is_active);

    return matchesSearch && matchesStatus;
  });

  const handleAddContact = async () => {
    try {
      console.log('Creating contact with data:', newContact);
      const result = await createContact(newContact);
      console.log('Contact creation result:', result);
      setNewContact({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        tags: [],
        custom_fields: {},
        is_active: true
      });
      setIsAddContactOpen(false);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleUpdateContact = async () => {
    if (!editingContact) return;
    
    try {
      await updateContact(editingContact);
      setEditingContact(null);
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await deleteContact(id);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleAddGroup = async () => {
    try {
      // Contact groups functionality disabled for now
      toast.success('Contact groups feature coming soon!');
      setNewGroup({ name: '', description: '' });
      setIsAddGroupOpen(false);
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const contactsToImport = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim());
          const contact: any = {
            first_name: '',
            last_name: '',
            phone: '',
            email: '',
            tags: [],
            custom_fields: {},
            is_active: true
          };
          
          headers.forEach((header, index) => {
            const value = values[index]?.replace(/"/g, '') || '';
            switch (header.toLowerCase()) {
              case 'first_name':
              case 'firstname':
                contact.first_name = value;
                break;
              case 'last_name':
              case 'lastname':
                contact.last_name = value;
                break;
              case 'phone':
              case 'mobile':
                contact.phone = value;
                break;
              case 'email':
                contact.email = value;
                break;
              default:
                if (value) {
                  contact.custom_fields[header] = value;
                }
            }
          });
          
          return contact;
        })
        .filter(contact => contact.phone);

      await importContacts(contactsToImport);
      toast.success(`Successfully imported ${contactsToImport.length} contacts`);
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast.error('Failed to import contacts');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Contacts</p>
                <p className="text-3xl font-bold text-gray-900">{contacts.length}</p>
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
                  {contacts.filter(c => c.is_active).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Groups</p>
                <p className="text-3xl font-bold text-gray-900">{contactGroups.length}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contact Management</CardTitle>
              <CardDescription>Manage your contact database and groups</CardDescription>
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              
              <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Add Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Contact Group</DialogTitle>
                    <DialogDescription>Create a new contact group</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="group-name">Group Name</Label>
                      <Input
                        id="group-name"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                        placeholder="Enter group name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="group-description">Description</Label>
                      <Input
                        id="group-description"
                        value={newGroup.description}
                        onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                        placeholder="Enter group description"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddGroup}>Add Group</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Contact</DialogTitle>
                    <DialogDescription>Create a new contact in your database</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first-name">First Name</Label>
                        <Input
                          id="first-name"
                          value={newContact.first_name}
                          onChange={(e) => setNewContact({...newContact, first_name: e.target.value})}
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input
                          id="last-name"
                          value={newContact.last_name}
                          onChange={(e) => setNewContact({...newContact, last_name: e.target.value})}
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                        placeholder="+254700000000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <CustomTagsInput
                        tags={newContact.tags}
                        onChange={(tags) => setNewContact({...newContact, tags})}
                        label="Tags (Optional)"
                        placeholder="Add tags to categorize this contact..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddContact}>Add Contact</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search contacts, tags..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions Bar */}
          {selectedContacts.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedContacts.length} selected</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedContacts([])}
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentActionType('activate');
                      setIsActionsDialogOpen(true);
                    }}
                  >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Activate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentActionType('deactivate');
                      setIsActionsDialogOpen(true);
                    }}
                  >
                    <UserX className="w-4 h-4 mr-1" />
                    Deactivate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentActionType('move');
                      setIsActionsDialogOpen(true);
                    }}
                  >
                    <Move className="w-4 h-4 mr-1" />
                    Move to Group
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentActionType('message');
                      setIsActionsDialogOpen(true);
                    }}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedContacts(filteredContacts);
                      } else {
                        setSelectedContacts([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id} className={selectedContacts.find(c => c.id === contact.id) ? 'bg-blue-50' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.some(c => c.id === contact.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedContacts([...selectedContacts, contact]);
                        } else {
                          setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {contact.first_name || contact.last_name 
                          ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                          : 'No Name'
                        }
                      </div>
                      {contact.tags && contact.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {contact.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {contact.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{contact.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.email || '-'}</TableCell>
                  <TableCell>
                    <Badge className={contact.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {contact.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedContacts([contact]);
                          setCurrentActionType('message');
                          setIsActionsDialogOpen(true);
                        }}
                        title="Send message"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingContact(contact)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteContact(contact.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Contact Dialog */}
      <Dialog open={!!editingContact} onOpenChange={(open) => !open && setEditingContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>Update contact information</DialogDescription>
          </DialogHeader>
          {editingContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-first-name">First Name</Label>
                  <Input
                    id="edit-first-name"
                    value={editingContact.first_name || ''}
                    onChange={(e) => setEditingContact({...editingContact, first_name: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-last-name">Last Name</Label>
                  <Input
                    id="edit-last-name"
                    value={editingContact.last_name || ''}
                    onChange={(e) => setEditingContact({...editingContact, last_name: e.target.value})}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editingContact.phone}
                  onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
                  placeholder="+254700000000"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingContact.email || ''}
                  onChange={(e) => setEditingContact({...editingContact, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <CustomTagsInput
                  tags={editingContact.tags || []}
                  onChange={(tags) => setEditingContact({...editingContact, tags})}
                  label="Tags"
                  placeholder="Add tags to categorize this contact..."
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingContact.is_active ? 'active' : 'inactive'}
                  onValueChange={(value) => setEditingContact({...editingContact, is_active: value === 'active'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateContact}>Update Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Actions Dialog */}
      <ContactActionsDialog
        isOpen={isActionsDialogOpen}
        onClose={() => {
          setIsActionsDialogOpen(false);
          setCurrentActionType(null);
        }}
        selectedContacts={selectedContacts}
        onRefresh={refetch}
        actionType={currentActionType}
      />
    </div>
  );
}