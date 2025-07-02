
import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserActions } from './UserActions';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  role?: string;
}

interface UserTableRowProps {
  user: User;
  onRoleUpdate: (userId: string, newRole: 'super_admin' | 'admin' | 'manager' | 'user') => void;
  onUserUpdated: () => void;
}

export function UserTableRow({ user, onRoleUpdate, onUserUpdated }: UserTableRowProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Placeholder handlers (basic functionality for UserTableRow)
  const handleEdit = () => {
    setIsLoading(true);
    // TODO: Implement edit functionality for basic user management
    console.log('Edit user:', user.id);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Edit functionality not yet implemented');
    }, 1000);
  };

  const handleCredits = () => {
    setIsLoading(true);
    // TODO: Implement credits management for basic user management
    console.log('Manage credits for user:', user.id);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Credits management not yet implemented');
    }, 1000);
  };

  const handleEmail = () => {
    setIsLoading(true);
    // TODO: Implement email functionality for basic user management
    console.log('Send email to user:', user.id);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Email functionality not yet implemented');
    }, 1000);
  };

  const handleDelete = () => {
    setIsLoading(true);
    // TODO: Implement delete functionality for basic user management
    console.log('Delete user:', user.id);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Delete functionality not yet implemented');
    }, 1000);
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">
            {user.first_name || user.last_name 
              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
              : user.email.split('@')[0]
            }
          </div>
        </div>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Select
          value={user.role || 'user'}
          onValueChange={(value) => onRoleUpdate(user.id, value as 'super_admin' | 'admin' | 'manager' | 'user')}
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
        />
      </TableCell>
    </TableRow>
  );
}
