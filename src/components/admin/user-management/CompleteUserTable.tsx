
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, AlertTriangle, UserPlus } from 'lucide-react';
import { CompleteUserTableRow } from './CompleteUserTableRow';
import { UserCreateDialog } from './UserCreateDialog';
import { BulkOperationsPanel } from './BulkOperationsPanel';
import { CompleteUser } from '@/hooks/useCompleteUserManagement';

interface CompleteUserTableProps {
  users: CompleteUser[];
  isLoading: boolean;
  onUserUpdated: () => void;
}

export function CompleteUserTable({ users, isLoading, onUserUpdated }: CompleteUserTableProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<CompleteUser[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (user: CompleteUser, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, user]);
    } else {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleBulkOperation = async (operation: string, params?: any) => {
    setBulkLoading(true);
    try {
      console.log('Bulk operation:', operation, 'on', selectedUsers.length, 'users', params);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear selection after successful operation
      setSelectedUsers([]);
      onUserUpdated();
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setBulkLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            Complete User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isPartiallySelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

  return (
    <>
      <BulkOperationsPanel
        selectedUsers={selectedUsers}
        onClearSelection={() => setSelectedUsers([])}
        onBulkOperation={handleBulkOperation}
        isLoading={bulkLoading}
      />

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              Complete User Management
              {users.some(u => !u.has_profile) && (
                <div className="relative group">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Some users are missing profiles
                  </div>
                </div>
              )}
            </CardTitle>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className={isPartiallySelected ? "data-[state=checked]:bg-blue-600" : ""}
                  />
                </TableHead>
                <TableHead>User Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role & Type</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <CompleteUserTableRow 
                  key={user.id}
                  user={user}
                  onUserUpdated={onUserUpdated}
                  isSelected={selectedUsers.some(u => u.id === user.id)}
                  onSelect={(checked) => handleSelectUser(user, checked)}
                />
              ))}
            </TableBody>
          </Table>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No users found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <UserCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onUserCreated={onUserUpdated}
      />
    </>
  );
}
