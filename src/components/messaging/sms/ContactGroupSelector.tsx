import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  User, 
  Search, 
  Plus, 
  X, 
  UserPlus,
  Phone,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useContactGroups } from '@/hooks/useContactGroups';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { validateAndFormatPhoneNumber, PHONE_ERROR_MESSAGES } from '@/utils/phoneValidation';
import { toast } from 'sonner';

interface ContactGroupSelectorProps {
  selectedContacts: string[];
  onContactsChange: (contacts: string[]) => void;
  onAddManualRecipient: (phone: string) => void;
}

export function ContactGroupSelector({ 
  selectedContacts, 
  onContactsChange,
  onAddManualRecipient 
}: ContactGroupSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [phoneValidation, setPhoneValidation] = useState<{ isValid: boolean; message?: string }>({ isValid: true });
  
  const { contacts = [], isLoading: contactsLoading } = useContacts();
  const { contactGroups = [], isLoading: groupsLoading } = useContactGroups();

  // Filter contacts and groups based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredGroups = contactGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch all group members for all visible groups in one call
  const groupIds = filteredGroups.map(g => g.id);
  const {
    data: allGroupMembers = [],
    isLoading: membersLoading
  } = useQuery({
    queryKey: ['contact-group-members', groupIds],
    queryFn: async () => {
      if (!groupIds.length) return [];
      const { data, error } = await supabase
        .from('contact_group_members')
        .select(`*, contacts:contact_id (id, first_name, last_name, phone, email)`) 
        .in('group_id', groupIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!groupIds.length
  });

  // Build a map of groupId to contact phone numbers
  const groupContactsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    if (Array.isArray(allGroupMembers)) {
      allGroupMembers.forEach((member: any) => {
        const groupId = member.group_id;
        const c = member.contacts;
        const validation = validateAndFormatPhoneNumber(c.phone);
        const phone = validation.isValid && validation.formattedNumber ? validation.formattedNumber : c.phone;
        if (!map[groupId]) map[groupId] = [];
        map[groupId].push(phone);
      });
    }
    return map;
  }, [allGroupMembers]);

  // Helper: is every contact in group selected?
  const isGroupSelected = (groupId: string) => {
    const groupPhones = groupContactsMap[groupId] || [];
    return groupPhones.length > 0 && groupPhones.every((phone) => selectedContacts.includes(phone));
  };

  // Helper: is some (but not all) contacts in group selected?
  const isGroupIndeterminate = (groupId: string) => {
    const groupPhones = groupContactsMap[groupId] || [];
    const selectedCount = groupPhones.filter((phone) => selectedContacts.includes(phone)).length;
    return selectedCount > 0 && selectedCount < groupPhones.length;
  };

  // ...existing code...

  const handleContactToggle = (contactPhone: string) => {
    const validation = validateAndFormatPhoneNumber(contactPhone);
    const phoneToUse = validation.isValid && validation.formattedNumber ? validation.formattedNumber : contactPhone;
    
    const isSelected = selectedContacts.includes(phoneToUse);
    if (isSelected) {
      onContactsChange(selectedContacts.filter(phone => phone !== phoneToUse));
    } else {
      onContactsChange([...selectedContacts, phoneToUse]);
    }
  };

  const handleGroupToggle = (groupId: string) => {
    const groupPhones = groupContactsMap[groupId] || [];
    if (groupPhones.length === 0) {
      toast.error('This group has no contacts');
      return;
    }
    if (isGroupSelected(groupId)) {
      // Remove all group contacts
      onContactsChange(selectedContacts.filter((phone) => !groupPhones.includes(phone)));
    } else {
      // Add all group contacts (avoid duplicates)
      const newContacts = Array.from(new Set([...selectedContacts, ...groupPhones]));
      onContactsChange(newContacts);
    }
  };

  const handleManualPhoneChange = (value: string) => {
    setManualPhone(value);
    
    if (value.trim()) {
      const validation = validateAndFormatPhoneNumber(value);
      setPhoneValidation({
        isValid: validation.isValid,
        message: validation.errorMessage
      });
    } else {
      setPhoneValidation({ isValid: true });
    }
  };

  const handleAddManualPhone = () => {
    if (!manualPhone.trim()) return;
    
    const validation = validateAndFormatPhoneNumber(manualPhone);
    
    if (validation.isValid && validation.formattedNumber) {
      // Check if already selected
      if (selectedContacts.includes(validation.formattedNumber)) {
        toast.error('This phone number is already added');
        return;
      }
      
      onAddManualRecipient(validation.formattedNumber);
      setManualPhone('');
      setPhoneValidation({ isValid: true });
      toast.success('Phone number added successfully');
    } else {
      setPhoneValidation({
        isValid: false,
        message: validation.errorMessage
      });
      toast.error(validation.errorMessage || 'Invalid phone number');
    }
  };

  const handleSelectAll = () => {
    const allPhones = filteredContacts.map(contact => {
      const validation = validateAndFormatPhoneNumber(contact.phone);
      return validation.isValid && validation.formattedNumber ? validation.formattedNumber : contact.phone;
    });
    const uniquePhones = Array.from(new Set([...selectedContacts, ...allPhones]));
    onContactsChange(uniquePhones);
  };

  const handleClearAll = () => {
    onContactsChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Select Recipients
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts or groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Manual Phone Entry */}
        <div className="space-y-2">
          <Label htmlFor="manualPhone">Add Phone Number Manually</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="manualPhone"
                value={manualPhone}
                onChange={(e) => handleManualPhoneChange(e.target.value)}
                placeholder="Enter phone number (e.g., +254712345678, 0712345678)"
                onKeyPress={(e) => e.key === 'Enter' && handleAddManualPhone()}
                className={!phoneValidation.isValid ? 'border-red-500' : ''}
              />
              {!phoneValidation.isValid && phoneValidation.message && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {phoneValidation.message}
                </div>
              )}
              {phoneValidation.isValid && manualPhone.trim() && (
                <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Valid phone number format
                </div>
              )}
            </div>
            <Button 
              onClick={handleAddManualPhone} 
              disabled={!manualPhone.trim() || !phoneValidation.isValid}
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Supported formats: +254712345678, 0712345678, 0112345678, 712345678
          </p>
        </div>

        <Separator />

        {/* Selection Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedContacts.length} recipient{selectedContacts.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select All Visible
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>
        </div>

        {/* Tabs for Contacts and Groups */}
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Contacts ({filteredContacts.length})
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Groups ({filteredGroups.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="mt-4">
            <ScrollArea className="h-64">
              {contactsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No contacts found</p>
                  <p className="text-sm">Try adjusting your search or add contacts first</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredContacts.map((contact) => {
                    const phoneValidation = validateAndFormatPhoneNumber(contact.phone);
                    const phoneToUse = phoneValidation.isValid && phoneValidation.formattedNumber ? phoneValidation.formattedNumber : contact.phone;
                    const isSelected = selectedContacts.includes(phoneToUse);
                    
                    return (
                      <div
                        key={contact.id}
                        className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleContactToggle(contact.phone)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleContactToggle(contact.phone)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {contact.first_name} {contact.last_name}
                            </p>
                            {contact.tags && contact.tags.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {contact.tags[0]}
                              </Badge>
                            )}
                            {!phoneValidation.isValid && (
                              <Badge variant="destructive" className="text-xs">
                                Invalid Phone
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Phone className="w-3 h-3" />
                            <span className={!phoneValidation.isValid ? 'text-red-500' : ''}>
                              {contact.phone}
                            </span>
                            {phoneValidation.isValid && phoneValidation.formattedNumber !== contact.phone && (
                              <span className="text-green-600 text-xs">
                                → {phoneValidation.formattedNumber}
                              </span>
                            )}
                          </div>
                          {!phoneValidation.isValid && phoneValidation.errorMessage && (
                            <div className="flex items-center gap-1 text-xs text-red-500">
                              <AlertCircle className="w-3 h-3" />
                              {phoneValidation.errorMessage}
                            </div>
                          )}
                          {contact.email && (
                            <p className="text-xs text-gray-400 truncate">{contact.email}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="groups" className="mt-4">
            <ScrollArea className="h-64">
              {groupsLoading || membersLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No contact groups found</p>
                  <p className="text-sm">Create groups to organize your contacts</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleGroupToggle(group.id)}
                    >
                      <Checkbox
                        checked={isGroupSelected(group.id)}
                        // @ts-ignore: indeterminate is valid for HTMLInputElement
                        ref={el => { if (el && 'indeterminate' in el) (el as HTMLInputElement).indeterminate = isGroupIndeterminate(group.id); }}
                        onChange={() => handleGroupToggle(group.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {group.name}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {(groupContactsMap[group.id] || []).length} contacts
                          </Badge>
                        </div>
                        {group.description && (
                          <p className="text-xs text-gray-500 truncate ml-6">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Selected Recipients Summary */}
        {selectedContacts.length > 0 && (
          <div className="mt-4">
            <Label className="text-sm font-medium">Selected Recipients:</Label>
            <div className="flex flex-wrap gap-1 mt-2 max-h-20 overflow-y-auto">
              {selectedContacts.map((phone) => (
                <span key={phone} className="inline-flex items-center gap-1 text-xs bg-gray-100 rounded px-2 py-1 border border-gray-300">
                  {phone}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onContactsChange(selectedContacts.filter(p => p !== phone))}
                    className="h-auto p-0 hover:bg-transparent ml-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}