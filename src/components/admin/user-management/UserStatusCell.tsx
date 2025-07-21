
import React from 'react';
import { TableCell } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { CompleteUser } from '@/hooks/useCompleteUserManagement';

interface UserStatusCellProps {
  user: CompleteUser;
}

export function UserStatusCell({ user }: UserStatusCellProps) {
  const getStatusIcon = () => {
    if (!user.has_profile) {
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
    if (user.email_confirmed_at) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <TableCell>
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <div className="text-sm">
          {!user.has_profile && <div className="text-amber-600">Missing Profile</div>}
          {user.has_profile && user.email_confirmed_at && <div className="text-green-600">Verified</div>}
          {user.has_profile && !user.email_confirmed_at && <div className="text-red-600">Unverified</div>}
        </div>
      </div>
    </TableCell>
  );
}
