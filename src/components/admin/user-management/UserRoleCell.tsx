
import React from 'react';
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CompleteUser } from '@/hooks/useCompleteUserManagement';

interface UserRoleCellProps {
  user: CompleteUser;
}

export function UserRoleCell({ user }: UserRoleCellProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <TableCell>
      <div className="space-y-1">
        <Badge className={getRoleBadgeColor(user.role || 'user')} variant="secondary">
          {user.role || 'user'}
        </Badge>
        <div className="text-xs text-gray-500">
          {user.user_type || 'demo'}
        </div>
      </div>
    </TableCell>
  );
}
