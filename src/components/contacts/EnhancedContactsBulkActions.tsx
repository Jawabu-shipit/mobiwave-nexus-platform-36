import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Users, Move, Trash2, UserPlus, AlertTriangle } from 'lucide-react';
import { useContactGroups } from '@/hooks/contacts/useContactGroups';
import { useContactMutations } from '@/hooks/contacts/useContactMutations';
import { useContactGroupOperations } from '@/hooks/contacts/useContactGroupOperations';
import { validateAndFormatPhoneNumber } from '@/utils/phoneValidation';

interface EnhancedContactsBulkActionsProps {
  selectedContacts: any[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export function EnhancedContactsBulkActions({
  selectedContacts,
  onClearSelection,
  onRefresh
}: EnhancedContactsBulkActionsProps) {
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'move' | 'delete' | 'validate'>('move');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { contactGroups } = useContactGroups();
  const { deleteContact } = useContactMutations();
  const { bulkAddContactsToGroup, bulkRemoveContactsFromGroup } = useContactGroupOperations();

  const handleBulkAction = async () => {
    if (selectedContacts.length === 0) {
      toast.error('No contacts selected');
      return;
    }

    setIsProcessing(true);

    try {
      switch (actionType) {
        case 'move':
          if (!selectedGroupId) {
            toast.error('Please select a group');
            return;
          }
          // Implementation for moving contacts to group
          await handleMoveToGroup();
          break;
        
        case 'delete':
          await handleBulkDelete();
          break;
        
        case 'validate':
          await handleBulkValidation();
          break;
      }

      onClearSelection();
      onRefresh();
      setIsActionDialogOpen(false);
    } catch (error: any) {
      toast.error(`Bulk action failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMoveToGroup = async () => {
    const contactIds = selectedContacts.map(contact => contact.id);
    await bulkAddContactsToGroup({ contactIds, groupId: selectedGroupId });
    toast.success(`${selectedContacts.length} contacts moved to group successfully`);
  };

  const handleBulkDelete = async () => {
    let deletedCount = 0;
    const failedDeletes: string[] = [];
    
    for (const contact of selectedContacts) {
      try {
        await deleteContact(contact.id);
        deletedCount++;
      } catch (error) {
        failedDeletes.push(contact.first_name || contact.phone);
      }
    }
    
    if (deletedCount > 0) {
      toast.success(`Successfully deleted ${deletedCount} contacts`);
    }
    if (failedDeletes.length > 0) {
      toast.error(`Failed to delete ${failedDeletes.length} contacts`);
    }
  };

  const handleBulkValidation = async () => {
    const validationResults = selectedContacts.map(contact => {
      const validatedPhone = validateAndFormatPhoneNumber(contact.phone);
      return {
        ...contact,
        validPhone: validatedPhone,
        isValid: !!validatedPhone
      };
    });
    
    const invalidContacts = validationResults.filter(r => !r.isValid);
    const validContacts = validationResults.filter(r => r.isValid);
    
    if (invalidContacts.length > 0) {
      toast.error(`${invalidContacts.length} contacts have invalid phone numbers`);
    }
    if (validContacts.length > 0) {
      toast.success(`${validContacts.length} contacts have valid phone numbers`);
    }
  };

  if (selectedContacts.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Bulk Actions
            <Badge variant="secondary">{selectedContacts.length} selected</Badge>
          </span>
          <Button variant="outline" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActionType('move')}
                className="flex items-center gap-2"
              >
                <Move className="w-4 h-4" />
                Move to Group
              </Button>
            </DialogTrigger>
          </Dialog>

          <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActionType('validate')}
                className="flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Validate Phone Numbers
              </Button>
            </DialogTrigger>
          </Dialog>

          <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setActionType('delete')}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {actionType === 'move' && 'Move Contacts to Group'}
                  {actionType === 'delete' && 'Delete Selected Contacts'}
                  {actionType === 'validate' && 'Validate Phone Numbers'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {actionType === 'move' && (
                  <div className="space-y-2">
                    <Label>Select Target Group</Label>
                    <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactGroups.map(group => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name} ({group.contact_count} contacts)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {actionType === 'delete' && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-800 mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Warning</span>
                    </div>
                    <p className="text-sm text-red-700">
                      This action will permanently delete {selectedContacts.length} contacts. 
                      This cannot be undone.
                    </p>
                  </div>
                )}

                {actionType === 'validate' && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      This will check all selected contacts for valid Kenyan phone number formats 
                      and show you a summary of any validation issues.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Selected Contacts ({selectedContacts.length})</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {selectedContacts.slice(0, 10).map(contact => (
                      <div key={contact.id} className="text-sm text-gray-600 flex items-center gap-2">
                        <Checkbox checked disabled />
                        {contact.first_name} {contact.last_name} ({contact.phone})
                      </div>
                    ))}
                    {selectedContacts.length > 10 && (
                      <div className="text-sm text-gray-500">
                        ... and {selectedContacts.length - 10} more contacts
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsActionDialogOpen(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBulkAction}
                    disabled={isProcessing || (actionType === 'move' && !selectedGroupId)}
                    className={actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Action'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}