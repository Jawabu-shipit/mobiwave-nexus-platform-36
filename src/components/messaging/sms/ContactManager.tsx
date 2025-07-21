
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Upload, Download, Search, Filter, Tag, Edit, Trash2, UserPlus, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  tags: string[];
  groups: string[];
  createdAt: string;
  lastContacted?: string;
}

interface ContactGroup {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  createdAt: string;
}

export function ContactManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);

  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    tags: [] as string[],
    groups: [] as string[]
  });

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: ''
  });

  const [tagInput, setTagInput] = useState('');

  const addContact = () => {
    if (!newContact.phone) {
      toast.error('Phone number is required');
      return;
    }

    const contact: Contact = {
      id: `contact-${Date.now()}`,
      ...newContact,
      createdAt: new Date().toISOString()
    };

    setContacts(prev => [...prev, contact]);
    setNewContact({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      tags: [],
      groups: []
    });
    setShowAddContact(false);
    toast.success('Contact added successfully');
  };

  const addGroup = () => {
    if (!newGroup.name) {
      toast.error('Group name is required');
      return;
    }

    const group: ContactGroup = {
      id: `group-${Date.now()}`,
      ...newGroup,
      contactCount: 0,
      createdAt: new Date().toISOString()
    };

    setGroups(prev => [...prev, group]);
    setNewGroup({ name: '', description: '' });
    setShowAddGroup(false);
    toast.success('Group created successfully');
  };

  const addTag = (tag: string) => {
    if (tag && !newContact.tags.includes(tag)) {
      setNewContact(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewContact(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllContacts = () => {
    const filteredContactIds = filteredContacts.map(c => c.id);
    setSelectedContacts(prev => 
      prev.length === filteredContactIds.length ? [] : filteredContactIds
    );
  };

  const deleteSelectedContacts = () => {
    setContacts(prev => prev.filter(c => !selectedContacts.includes(c.id)));
    setSelectedContacts([]);
    toast.success(`${selectedContacts.length} contacts deleted`);
  };

  const exportContacts = () => {
    const csvContent = [
      'firstName,lastName,phone,email,tags,groups',
      ...contacts.map(c => 
        `${c.firstName},${c.lastName},${c.phone},${c.email || ''},${c.tags.join(';')},${c.groups.join(';')}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Contacts exported successfully');
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchTerm === '' || 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm);
    
    const matchesTag = filterTag === '' || contact.tags.includes(filterTag);
    const matchesGroup = filterGroup === '' || contact.groups.includes(filterGroup);
    
    return matchesSearch && matchesTag && matchesGroup;
  });

  const allTags = Array.from(new Set(contacts.flatMap(c => c.tags)));
  const allGroups = Array.from(new Set(contacts.flatMap(c => c.groups)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Management</h2>
          <p className="text-gray-600">Manage your contact lists, groups, and tags</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportContacts}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddGroup} onOpenChange={setShowAddGroup}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Create a new contact group to organize your contacts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <Label htmlFor="groupDescription">Description</Label>
                  <Input
                    id="groupDescription"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter group description"
                  />
                </div>
                <Button onClick={addGroup} className="w-full">
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Add a new contact to your database
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newContact.firstName}
                      onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newContact.lastName}
                      onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+254712345678"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tag"
                      onKeyPress={(e) => e.key === 'Enter' && addTag(tagInput)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addTag(tagInput)}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {newContact.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button onClick={addContact} className="w-full">
                  Add Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="contacts" className="w-full">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contacts Database</CardTitle>
                  <CardDescription>
                    {contacts.length} contacts • {selectedContacts.length} selected
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filterTag} onValueChange={setFilterTag}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Tags</SelectItem>
                      {allTags.map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterGroup} onValueChange={setFilterGroup}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Groups</SelectItem>
                      {allGroups.map(group => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedContacts.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    {selectedContacts.length} contacts selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedContacts([])}>
                      Clear Selection
                    </Button>
                    <Button size="sm" variant="destructive" onClick={deleteSelectedContacts}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              )}

              {filteredContacts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedContacts.length === filteredContacts.length}
                          onChange={selectAllContacts}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Groups</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map(contact => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => toggleContactSelection(contact.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </TableCell>
                        <TableCell>{contact.phone}</TableCell>
                        <TableCell>{contact.email || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {contact.groups.map(group => (
                              <Badge key={group} variant="outline" className="text-xs">
                                {group}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                setContacts(prev => prev.filter(c => c.id !== contact.id));
                                toast.success('Contact deleted');
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No contacts found</p>
                  <p className="text-sm text-gray-400">Add contacts or adjust your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Groups</CardTitle>
              <CardDescription>
                Organize your contacts into groups for targeted campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups.map(group => (
                    <Card key={group.id} className="border-2 hover:border-blue-300 transition-colors">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription>{group.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">
                            {group.contactCount} contacts
                          </Badge>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No groups created yet</p>
                  <p className="text-sm text-gray-400">Create groups to organize your contacts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
