
import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, CreditCard, Mail, Trash2 } from 'lucide-react';

interface UserActionsProps {
  onEdit: () => void;
  onCredits: () => void;
  onEmail: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

export function UserActions({ onEdit, onCredits, onEmail, onDelete, isLoading }: UserActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isLoading}>
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCredits}>
          <CreditCard className="w-4 h-4 mr-2" />
          Manage Credits
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEmail}>
          <Mail className="w-4 h-4 mr-2" />
          Send Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
