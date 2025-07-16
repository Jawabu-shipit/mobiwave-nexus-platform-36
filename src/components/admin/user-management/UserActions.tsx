
import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, CreditCard, Mail, Trash2, ShieldAlert, UserCheck } from 'lucide-react';

interface UserActionsProps {
  onEdit: () => void;
  onCredits: () => void;
  onEmail: () => void;
  onDelete: () => void;
  isLoading: boolean;
  isDisabled?: boolean;
  onReactivate?: () => void;
}

/**
 * Enhanced UserActions component with security features
 * Provides dropdown menu for user management actions
 */
export function UserActions({ 
  onEdit, 
  onCredits, 
  onEmail, 
  onDelete, 
  isLoading, 
  isDisabled = false,
  onReactivate
}: UserActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={isLoading}
          className={isDisabled ? 'text-gray-400' : ''}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {isDisabled && onReactivate ? (
          // Show reactivate option for disabled users
          <>
            <DropdownMenuItem onClick={onReactivate} className="text-green-600">
              <UserCheck className="w-4 h-4 mr-2" />
              Reactivate User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-gray-500">
              Other actions unavailable for inactive users
            </div>
          </>
        ) : (
          // Show normal actions for active users
          <>
            <DropdownMenuItem onClick={onEdit} disabled={isDisabled || isLoading}>
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCredits} disabled={isDisabled || isLoading}>
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Credits
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEmail} disabled={isDisabled || isLoading}>
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onDelete} 
              className="text-red-600 focus:text-red-50 focus:bg-red-600"
              disabled={isDisabled || isLoading}
            >
              <ShieldAlert className="w-4 h-4 mr-2" />
              Deactivate User
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
