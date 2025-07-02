
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Mail, 
  CreditCard, 
  Shield, 
  Ban, 
  CheckCircle, 
  Trash2, 
  X,
  AlertTriangle
} from 'lucide-react';
import { CompleteUser } from '@/hooks/useCompleteUserManagement';

interface BulkOperationsPanelProps {
  selectedUsers: CompleteUser[];
  onClearSelection: () => void;
  onBulkOperation: (operation: string, params?: any) => Promise<void>;
  isLoading: boolean;
}

export function BulkOperationsPanel({ 
  selectedUsers, 
  onClearSelection, 
  onBulkOperation, 
  isLoading 
}: BulkOperationsPanelProps) {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [emailContent, setEmailContent] = useState({ subject: '', message: '' });
  const [creditsAmount, setCreditsAmount] = useState(0);
  const [newRole, setNewRole] = useState('user');

  if (selectedUsers.length === 0) return null;

  const handleBulkEmail = async () => {
    await onBulkOperation('send_email', emailContent);
    setShowEmailDialog(false);
    setEmailContent({ subject: '', message: '' });
  };

  const handleBulkCredits = async () => {
    await onBulkOperation('add_credits', { amount: creditsAmount });
    setShowCreditsDialog(false);
    setCreditsAmount(0);
  };

  const handleBulkRole = async () => {
    await onBulkOperation('change_role', { role: newRole });
    setShowRoleDialog(false);
    setNewRole('user');
  };

  return (
    <>
      <Card className="border-l-4 border-l-blue-500 bg-blue-50/70 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedUsers.length} user{selectedUsers.length === 1 ? '' : 's'} selected
                </span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Bulk Operations Available
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmailDialog(true)}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreditsDialog(true)}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  <CreditCard className="w-4 h-4" />
                  Credits
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoleDialog(true)}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  <Shield className="w-4 h-4" />
                  Role
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkOperation('suspend')}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  <Ban className="w-4 h-4" />
                  Suspend
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Bulk Email</DialogTitle>
            <DialogDescription>
              Send an email to {selectedUsers.length} selected user{selectedUsers.length === 1 ? '' : 's'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Email subject"
              value={emailContent.subject}
              onChange={(e) => setEmailContent(prev => ({ ...prev, subject: e.target.value }))}
            />
            <textarea
              placeholder="Email message"
              className="w-full p-3 border rounded-md resize-none h-32"
              value={emailContent.message}
              onChange={(e) => setEmailContent(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEmail} disabled={!emailContent.subject || !emailContent.message}>
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credits Dialog */}
      <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Credits</DialogTitle>
            <DialogDescription>
              Add credits to {selectedUsers.length} selected user{selectedUsers.length === 1 ? '' : 's'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Credits amount"
              value={creditsAmount}
              onChange={(e) => setCreditsAmount(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreditsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkCredits} disabled={creditsAmount <= 0}>
              <CreditCard className="w-4 h-4 mr-2" />
              Add Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Change role for {selectedUsers.length} selected user{selectedUsers.length === 1 ? '' : 's'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkRole}>
              <Shield className="w-4 h-4 mr-2" />
              Change Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
