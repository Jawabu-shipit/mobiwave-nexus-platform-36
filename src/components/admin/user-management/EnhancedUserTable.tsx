
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Database, Globe } from 'lucide-react';
import { EnhancedUserTableRow } from './EnhancedUserTableRow';
import { CombinedUser } from '@/hooks/useEnhancedUserManagement';

interface EnhancedUserTableProps {
  users: CombinedUser[];
  isLoading: boolean;
  onUserUpdated: () => void;
}

export function EnhancedUserTable({ users, isLoading, onUserUpdated }: EnhancedUserTableProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            Enhanced User Management
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

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          Enhanced User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type/Source</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role/Status</TableHead>
              <TableHead>Created/Balance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <EnhancedUserTableRow 
                key={`${user.source}-${user.id}`}
                user={user}
                onUserUpdated={onUserUpdated}
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
  );
}
