
import React, { useState } from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  CreditCard,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserEditDialog } from './UserEditDialog';
import { UserDeleteDialog } from './UserDeleteDialog';
import { UserCreditsDialog } from './UserCreditsDialog';
import { CompleteUser } from '@/hooks/useCompleteUserManagement';

interface CompleteUserTableRowProps {
  user: CompleteUser;
  onUserUpdated: () => void;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
}

export function CompleteUserTableRow({ 
  user, 
  onUserUpdated, 
  isSelected = false, 
  onSelect 
}: CompleteUserTableRowProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [creditsDialogOpen, setCreditsDialogOpen] = useState(false);

  const getStatusColor = (confirmed: boolean, hasProfile: boolean) => {
    if (!confirmed) return 'bg-red-100 text-red-800';
    if (!hasProfile) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusIcon = (confirmed: boolean, hasProfile: boolean) => {
    if (!confirmed) return <AlertTriangle className="w-3 h-3" />;
    if (!hasProfile) return <Clock className="w-3 h-3" />;
    return <CheckCircle className="w-3 h-3" />;
  };

  const getStatusText = (confirmed: boolean, hasProfile: boolean) => {
    if (!confirmed) return 'Unverified';
    if (!hasProfile) return 'Incomplete';
    return 'Active';
  };

  const formatLastActivity = (lastSignIn: string | null) => {
    if (!lastSignIn) return 'Never';
    const date = new Date(lastSignIn);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <TableRow className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
        <TableCell>
          {onSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
            />
          )}
        </TableCell>
        
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {user.has_profile ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : user.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-3 h-3" />
                {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="w-3 h-3" />
                  {user.phone}
                </div>
              )}
            </div>
          </div>
        </TableCell>

        <TableCell>
          <Badge className={getStatusColor(user.email_confirmed_at !== null, user.has_profile)}>
            {getStatusIcon(user.email_confirmed_at !== null, user.has_profile)}
            <span className="ml-1">{getStatusText(user.email_confirmed_at !== null, user.has_profile)}</span>
          </Badge>
        </TableCell>

        <TableCell>
          <div className="space-y-1">
            <Badge variant="outline" className="flex items-center gap-1 w-fit">
              <Shield className="w-3 h-3" />
              {user.role || 'user'}
            </Badge>
            {user.user_type && (
              <div className="text-xs text-gray-500">{user.user_type}</div>
            )}
          </div>
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-600">
              ${user.credits_remaining?.toFixed(2) || '0.00'}
            </span>
          </div>
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-3 h-3" />
            {formatLastActivity(user.last_sign_in_at)}
          </div>
        </TableCell>

        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCreditsDialogOpen(true)}>
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Credits
              </DropdownMenuItem>
              {!user.has_profile && (
                <DropdownMenuItem>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Create Profile
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <UserEditDialog
        user={user}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUserUpdated={onUserUpdated}
      />

      <UserDeleteDialog
        user={user}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onUserDeleted={onUserUpdated}
      />

      <UserCreditsDialog
        user={user}
        open={creditsDialogOpen}
        onOpenChange={setCreditsDialogOpen}
        onCreditsUpdated={onUserUpdated}
      />
    </>
  );
}
