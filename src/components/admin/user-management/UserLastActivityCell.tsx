
import React from 'react';
import { TableCell } from "@/components/ui/table";
import { CompleteUser } from '@/hooks/useCompleteUserManagement';

interface UserLastActivityCellProps {
  user: CompleteUser;
}

export function UserLastActivityCell({ user }: UserLastActivityCellProps) {
  return (
    <TableCell>
      <div className="text-sm text-gray-500">
        {user.last_sign_in_at 
          ? new Date(user.last_sign_in_at).toLocaleDateString()
          : 'Never'
        }
      </div>
    </TableCell>
  );
}
