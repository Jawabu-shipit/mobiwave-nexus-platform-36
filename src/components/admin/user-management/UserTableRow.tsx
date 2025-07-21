
import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserActions } from './UserActions';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Shield, AlertTriangle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  role?: string;
  status?: string;
}

interface UserTableRowProps {
  user: User;
  onRoleUpdate: (userId: string, newRole: 'super_admin' | 'admin' | 'manager' | 'user') => void;
  onUserUpdated: () => void;
}

/**
 * Enhanced UserTableRow component with security features
 * Uses the secure API service instead of direct Supabase calls
 */
export function UserTableRow({ user, onRoleUpdate, onUserUpdated }: UserTableRowProps) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreditsDialogOpen, setIsCreditsDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get current user for audit logging
  const { user: currentUser } = useAuth();
  
  // Form state
  const [editedUser, setEditedUser] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email
  });
  
  const [creditsAmount, setCreditsAmount] = useState('100');
  const [creditsReason, setCreditsReason] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Open edit dialog
  const handleEdit = () => {
    setIsEditDialogOpen(true);
    setError(null);
  };

  // Save user edits
  const saveUserEdit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate input
      if (!editedUser.first_name && !editedUser.last_name) {
        setError('At least one name field is required');
        setIsLoading(false);
        return;
      }
      
      // Use secure API service
      await api.update('profiles', user.id, {
        first_name: editedUser.first_name,
        last_name: editedUser.last_name,
        updated_by: currentUser?.id,
        updated_at: new Date().toISOString()
      }, {
        userId: currentUser?.id
      });
      
      toast.success('User updated successfully');
      onUserUpdated();
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      setError(error.message || 'Failed to update user');
      toast.error('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  // Open credits dialog
  const handleCredits = () => {
    setIsCreditsDialogOpen(true);
    setError(null);
  };
  
  // Add credits to user
  const addCredits = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate input
      const credits = Number(creditsAmount);
      if (isNaN(credits) || credits <= 0) {
        setError('Please enter a valid positive number');
        setIsLoading(false);
        return;
      }
      
      if (!creditsReason.trim()) {
        setError('Please provide a reason for adding credits');
        setIsLoading(false);
        return;
      }
      
      // First check if user has a credits record
      const existingCredits = await api.fetch('user_credits', {
        filter: { user_id: user.id },
        userId: currentUser?.id,
        single: true
      }).catch(() => null);
      
      if (existingCredits) {
        // Update existing credits
        await api.update('user_credits', existingCredits.id, {
          credits_remaining: existingCredits.credits_remaining + credits,
          updated_at: new Date().toISOString(),
          updated_by: currentUser?.id
        }, {
          userId: currentUser?.id
        });
      } else {
        // Create new credits record
        await api.create('user_credits', {
          user_id: user.id,
          credits_remaining: credits,
          credits_total: credits,
          created_by: currentUser?.id,
          created_at: new Date().toISOString()
        }, {
          userId: currentUser?.id
        });
      }
      
      // Add transaction record with audit information
      await api.create('credit_transactions', {
        user_id: user.id,
        amount: credits,
        transaction_type: 'admin_credit',
        status: 'completed',
        description: creditsReason || 'Credits added by administrator',
        created_by: currentUser?.id,
        created_at: new Date().toISOString(),
        ip_address: 'admin_interface' // In a real implementation, this would be the actual IP
      }, {
        userId: currentUser?.id
      });
      
      // Create notification for the user
      await api.create('notifications', {
        user_id: user.id,
        title: 'Credits Added',
        message: `${credits} credits have been added to your account by an administrator.`,
        type: 'credit',
        is_read: false,
        created_at: new Date().toISOString()
      }, {
        userId: currentUser?.id
      });
      
      toast.success(`${credits} credits added successfully`);
      setIsCreditsDialogOpen(false);
    } catch (error: any) {
      console.error('Error adding credits:', error);
      setError(error.message || 'Failed to add credits');
      toast.error('Failed to add credits');
    } finally {
      setIsLoading(false);
    }
  };

  // Open email dialog
  const handleEmail = () => {
    setIsEmailDialogOpen(true);
    setError(null);
  };
  
  // Send email notification
  const sendEmail = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate input
      if (!emailSubject.trim()) {
        setError('Subject is required');
        setIsLoading(false);
        return;
      }
      
      if (!emailBody.trim()) {
        setError('Message is required');
        setIsLoading(false);
        return;
      }
      
      // Create notification record with audit information
      await api.create('notifications', {
        user_id: user.id,
        title: emailSubject,
        message: emailBody,
        type: 'email',
        is_read: false,
        created_at: new Date().toISOString(),
        created_by: currentUser?.id,
        source: 'admin_interface'
      }, {
        userId: currentUser?.id
      });
      
      // In a real implementation, this would also send an actual email
      // For now, we'll just create the notification record
      
      // Log the email send for audit purposes
      await api.create('audit_logs', {
        user_id: currentUser?.id,
        action: 'SEND_EMAIL',
        resource: `user/${user.id}`,
        data: {
          recipient: user.email,
          subject: emailSubject,
          // Don't log the full message body for privacy
          message_length: emailBody.length
        },
        timestamp: new Date().toISOString()
      }, {
        userId: currentUser?.id
      });
      
      toast.success('Email notification sent successfully');
      setIsEmailDialogOpen(false);
      setEmailSubject('');
      setEmailBody('');
    } catch (error: any) {
      console.error('Error sending email:', error);
      setError(error.message || 'Failed to send email');
      toast.error('Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  // Open delete confirmation dialog
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
    setError(null);
  };
  
  // Deactivate user (soft delete)
  const confirmDelete = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use secure API function for user deactivation
      await api.function('secure-admin-users', {
        action: 'deactivate',
        userId: user.id,
        adminId: currentUser?.id
      }, {
        userId: currentUser?.id
      });
      
      // Log the deactivation for audit purposes
      await api.create('audit_logs', {
        user_id: currentUser?.id,
        action: 'DEACTIVATE_USER',
        resource: `user/${user.id}`,
        data: {
          user_email: user.email,
          reason: 'Admin deactivation'
        },
        timestamp: new Date().toISOString()
      }, {
        userId: currentUser?.id
      });
      
      toast.success('User deactivated successfully');
      onUserUpdated();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      setError(error.message || 'Failed to deactivate user');
      toast.error('Failed to deactivate user');
    } finally {
      setIsLoading(false);
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email.split('@')[0];
  };

  return (
    <>
      <TableRow className={user.status === 'inactive' ? 'bg-gray-50 opacity-70' : ''}>
        <TableCell>
          <div>
            <div className="font-medium flex items-center gap-1">
              {getUserDisplayName()}
              {user.status === 'inactive' && (
                <Badge variant="outline" className="ml-2 text-xs bg-gray-100 text-gray-700 border-gray-200">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>
          <Select
            value={user.role || 'user'}
            onValueChange={(value) => onRoleUpdate(user.id, value as 'super_admin' | 'admin' | 'manager' | 'user')}
            disabled={user.status === 'inactive'}
          >
            <SelectTrigger className="w-32">
              <SelectValue>
                <Badge className={getRoleBadgeColor(user.role || 'user')} variant="secondary">
                  {user.role || 'user'}
                </Badge>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          {new Date(user.created_at).toLocaleDateString()}
        </TableCell>
        <TableCell>
          <UserActions
            onEdit={handleEdit}
            onCredits={handleCredits}
            onEmail={handleEmail}
            onDelete={handleDelete}
            isLoading={isLoading}
            isDisabled={user.status === 'inactive'}
          />
        </TableCell>
      </TableRow>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" /> Edit User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input 
                id="first_name" 
                value={editedUser.first_name} 
                onChange={(e) => setEditedUser({...editedUser, first_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input 
                id="last_name" 
                value={editedUser.last_name} 
                onChange={(e) => setEditedUser({...editedUser, last_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={editedUser.email} disabled />
              <p className="text-sm text-gray-500">Email cannot be changed</p>
            </div>
            
            {error && (
              <div className="bg-red-50 p-3 rounded border border-red-200 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveUserEdit} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credits Dialog */}
      <Dialog open={isCreditsDialogOpen} onOpenChange={setIsCreditsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" /> Add Credits
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="credits_amount">Amount</Label>
              <Input 
                id="credits_amount" 
                type="number" 
                value={creditsAmount} 
                onChange={(e) => setCreditsAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credits_reason">Reason (for audit purposes)</Label>
              <Textarea 
                id="credits_reason" 
                value={creditsReason} 
                onChange={(e) => setCreditsReason(e.target.value)}
                placeholder="Reason for adding credits"
                className="min-h-[80px]"
              />
            </div>
            <p className="text-sm text-gray-500">
              Adding credits to {getUserDisplayName()}
            </p>
            
            {error && (
              <div className="bg-red-50 p-3 rounded border border-red-200 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreditsDialogOpen(false)}>Cancel</Button>
            <Button onClick={addCredits} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Add Credits'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" /> Send Email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email_to">To</Label>
              <Input id="email_to" value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_subject">Subject</Label>
              <Input 
                id="email_subject" 
                value={emailSubject} 
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_body">Message</Label>
              <Textarea 
                id="email_body" 
                value={emailBody} 
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Enter email message"
                className="min-h-[120px]"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 p-3 rounded border border-red-200 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={sendEmail} 
              disabled={isLoading || !emailSubject || !emailBody}
            >
              {isLoading ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" /> Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the user account for <strong>{user.email}</strong>. The user will no longer be able to log in.
              This action is reversible only by a system administrator.
            </AlertDialogDescription>
            
            {error && (
              <div className="bg-red-50 p-3 rounded border border-red-200 flex items-start gap-2 mt-4">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Deactivating...' : 'Deactivate User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
