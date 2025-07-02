
import React from 'react';
import { TableCell } from "@/components/ui/table";
import { CompleteUser } from '@/hooks/useCompleteUserManagement';

interface UserCreditsCellProps {
  user: CompleteUser;
}

export function UserCreditsCell({ user }: UserCreditsCellProps) {
  return (
    <TableCell>
      <div className="text-sm">
        <div className="font-medium text-green-600">
          {user.credits_remaining?.toFixed(2) || '0.00'} credits
        </div>
        <div className="text-gray-500">
          Purchased: {user.credits_purchased?.toFixed(2) || '0.00'}
        </div>
      </div>
    </TableCell>
  );
}
