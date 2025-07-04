import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Send, Users, UserCheck, UserX, Move } from 'lucide-react';
import { useContactGroups } from '@/hooks/contacts/useContactGroups';
import { useContactMutations } from '@/hooks/contacts/useContactMutations';
import { useContactGroupOperations } from '@/hooks/contacts/useContactGroupOperations';
import { Contact } from '@/hooks/contacts/useContactsData';
import { useUnifiedSMSService } from '@/hooks/useUnifiedSMSService';

interface ContactActionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContacts: Contact[];
  onRefresh: () => void;
  actionType: 'activate' | 'deactivate' | 'message' | 'move' | null;
}

export function ContactActionsDialog({
  isOpen,
  onClose,
  selectedContacts,
  onRefresh,
  actionType
}: ContactActionsDialogProps) {
  const [message, setMessage] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { contactGroups } = useContactGroups();
  const { updateContact } = useContactMutations();
  const { bulkAddContactsToGroup } = useContactGroupOperations();
  const { sendUnifiedSMS } = useUnifiedSMSService();

  const handleAction = async () => {
    if (selectedContacts.length === 0) {
      toast.error('No contacts selected');
      return;
    }

    setIsProcessing(true);

    try {
      switch (actionType) {
        case 'activate':
          await handleBulkStatusChange(true);
          break;
        case 'deactivate':
          await handleBulkStatusChange(false);
          break;
        case 'message':
          await handleSendMessage();
          break;
        case 'move':
          await handleMoveToGroup();
          break;
      }

      onRefresh();
      onClose();
    } catch (error: any) {
      toast.error(`Action failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkStatusChange = async (isActive: boolean) => {
    let successCount = 0;
    const failedContacts: string[] = [];

    for (const contact of selectedContacts) {
      try {
        await updateContact({
          id: contact.id,
          is_active: isActive
        });
        successCount++;
      } catch (error) {
        failedContacts.push(contact.first_name || contact.phone);
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully ${isActive ? 'activated' : 'deactivated'} ${successCount} contacts`);
    }
    if (failedContacts.length > 0) {
      toast.error(`Failed to update ${failedContacts.length} contacts`);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      const recipients = selectedContacts.map(contact => contact.phone);
      
      await sendUnifiedSMS({
        recipients,
        message: message.trim(),
        campaignName: `Contact Message - ${new Date().toLocaleString()}`,
        metadata: {
          type: 'direct_contact_message',
          contactCount: selectedContacts.length
        }
      });
      
      toast.success(`Message sent to ${selectedContacts.length} contacts successfully!`);
    } catch (error: any) {
      console.error('SMS sending error:', error);
      toast.error(`Failed to send message: ${error.message}`);
    }
  };

  const handleMoveToGroup = async () => {
    if (!selectedGroupId) {
      toast.error('Please select a group');
      return;
    }

    const contactIds = selectedContacts.map(contact => contact.id);
    await bulkAddContactsToGroup({ contactIds, groupId: selectedGroupId });
    toast.success(`${selectedContacts.length} contacts moved to group successfully`);
  };

  const getDialogTitle = () => {
    switch (actionType) {
      case 'activate':
        return 'Activate Contacts';
      case 'deactivate':
        return 'Deactivate Contacts';
      case 'message':
        return 'Send Message to Contacts';
      case 'move':
        return 'Move Contacts to Group';
      default:
        return 'Contact Action';
    }
  };

  const getActionIcon = () => {
    switch (actionType) {
      case 'activate':
        return <UserCheck className="w-5 h-5 text-green-600" />;
      case 'deactivate':
        return <UserX className="w-5 h-5 text-red-600" />;
      case 'message':
        return <Send className="w-5 h-5 text-blue-600" />;
      case 'move':
        return <Move className="w-5 h-5 text-purple-600" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getActionIcon()}
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected contacts summary */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Selected Contacts</span>
              <Badge variant="secondary">{selectedContacts.length}</Badge>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {selectedContacts.slice(0, 5).map(contact => (
                <div key={contact.id} className="text-xs text-gray-600">
                  {contact.first_name} {contact.last_name} - {contact.phone}
                </div>
              ))}
              {selectedContacts.length > 5 && (
                <div className="text-xs text-gray-500">
                  ... and {selectedContacts.length - 5} more
                </div>
              )}
            </div>
          </div>

          {/* Action-specific content */}
          {actionType === 'activate' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                This will activate {selectedContacts.length} contacts, making them available for messaging campaigns.
              </p>
            </div>
          )}

          {actionType === 'deactivate' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                This will deactivate {selectedContacts.length} contacts, excluding them from messaging campaigns.
              </p>
            </div>
          )}

          {actionType === 'message' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="message">Message Content</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{message.length} characters</span>
                  <span>Estimated SMS: {Math.ceil(message.length / 160)}</span>
                </div>
              </div>
            </div>
          )}

          {actionType === 'move' && (
            <div className="space-y-3">
              <div>
                <Label>Target Group</Label>
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
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction}
              disabled={
                isProcessing || 
                (actionType === 'message' && !message.trim()) ||
                (actionType === 'move' && !selectedGroupId)
              }
              className={
                actionType === 'deactivate' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : actionType === 'activate'
                  ? 'bg-green-600 hover:bg-green-700'
                  : ''
              }
            >
              {isProcessing ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}