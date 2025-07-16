import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Users, Mail, Ban, CheckCircle, Trash2, X, UserPlus, Shield } from 'lucide-react';
import { useContactGroupOperations } from '@/hooks/contacts/useContactGroupOperations';
import { useContactGroups } from '@/hooks/contacts/useContactGroups';
import { supabase } from '@/integrations/supabase/client';

interface AdminContactsBulkActionsProps {
  selectedContacts: any[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export function AdminContactsBulkActions({
  selectedContacts,
  onClearSelection,
  onRefresh
}: AdminContactsBulkActionsProps) {
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'move' | 'delete' | 'activate' | 'suspend' | 'email'>('move');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { contactGroups } = useContactGroups();
  const { bulkAddContactsToGroup, bulkRemoveContactsFromGroup } = useContactGroupOperations();

  const handleBulkAction = async () => {
    if (selectedContacts.length === 0) {
      toast.error('No contacts selected');
      return;
    }

    setIsProcessing(true);

    try {
      const contactIds = selectedContacts.map(contact => contact.id);
      
      switch (actionType) {
        case 'move':
          if (!selectedGroupId) {
            toast.error('Please select a group');
            return;
          }
          await bulkAddContactsToGroup({ contactIds, groupId: selectedGroupId });
          break;
        
        case 'delete':
          // Call admin edge function for bulk delete
          const { data: deleteData, error: deleteError } = await supabase.functions.invoke('admin-contacts', {
            body: {
              action: 'delete',
              contactIds
            }
          });
          
          if (deleteError) throw deleteError;
          break;
        
        case 'activate':
          // Call admin edge function for bulk activate
          const { data: activateData, error: activateError } = await supabase.functions.invoke('admin-contacts', {
            body: {
              action: 'activate',
              contactIds
            }
          });
          
          if (activateError) throw activateError;
          break;
          
        case 'suspend':
          // Call admin edge function for bulk suspend
          const { data: suspendData, error: suspendError } = await supabase.functions.invoke('admin-contacts', {
            body: {
              action: 'suspend',
              contactIds
            }
          });
          
          if (suspendError) throw suspendError;
          break;
          
        case 'email':
          // Call admin edge function for bulk email
          const { data: emailData, error: emailError } = await supabase.functions.invoke('admin-contacts', {
            body: {
              action: 'email',
              contactIds,
              emailContent: 'Admin notification email'
            }
          });
          
          if (emailError) throw emailError;
          break;
      }

      onClearSelection();
      onRefresh();
      setIsActionDialogOpen(false);
    } catch (error: any) {
      console.error('Admin bulk action failed:', error);
      toast.error(`Bulk action failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedContacts.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
            </span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Admin Actions Available
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-blue-600 border-blue-300"
                  onClick={() => setActionType('email')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </DialogTrigger>
            </Dialog>

            <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-green-600 border-green-300"
                  onClick={() => setActionType('activate')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate
                </Button>
              </DialogTrigger>
            </Dialog>

            <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-orange-600 border-orange-300"
                  onClick={() => setActionType('suspend')}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Suspend
                </Button>
              </DialogTrigger>
            </Dialog>

            <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-purple-600 border-purple-300"
                  onClick={() => setActionType('move')}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Move to Group
                </Button>
              </DialogTrigger>
            </Dialog>

            <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 border-red-300"
                  onClick={() => setActionType('delete')}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Admin Bulk Action
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {actionType === 'move' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Target Group</label>
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

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      You are about to perform a <strong>{actionType}</strong> action on {selectedContacts.length} contacts.
                      {actionType === 'delete' && ' This action cannot be undone.'}
                    </p>
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
                      {isProcessing ? 'Processing...' : `Confirm ${actionType}`}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onClearSelection}
              className="text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}