
import React from 'react';
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, User, Mail, Calendar } from 'lucide-react';
import { CompleteUser } from '@/hooks/useCompleteUserManagement';

interface UserTableCellProps {
  user: CompleteUser;
}

export function UserTableCell({ user }: UserTableCellProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getUserTypeBadgeColor = (userType: string) => {
    switch (userType) {
      case 'real': return 'bg-green-100 text-green-800';
      case 'demo': return 'bg-gray-100 text-gray-800';
      case 'mspace_client': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <>
      <TableCell>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <div className="font-medium">
              {user.first_name || user.last_name 
                ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                : user.email.split('@')[0]
              }
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              Joined: {formatDate(user.created_at)}
            </div>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {user.has_profile ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">
              {user.has_profile ? 'Profile Created' : 'Missing Profile'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {user.email_confirmed_at ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : user.email_confirmed_at === undefined ? (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">
              {user.email_confirmed_at 
                ? 'Email Verified' 
                : user.email_confirmed_at === undefined 
                  ? 'Status Unknown'
                  : 'Email Unverified'
              }
            </span>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="space-y-2">
          <Badge className={getRoleBadgeColor(user.role || 'user')} variant="secondary">
            {user.role || 'user'}
          </Badge>
          <br />
          <Badge className={getUserTypeBadgeColor(user.user_type || 'demo')} variant="outline">
            {user.user_type || 'demo'}
          </Badge>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="space-y-1">
          <div className="text-sm font-medium">
            Remaining: {user.credits_remaining?.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-gray-500">
            Purchased: {user.credits_purchased?.toFixed(2) || '0.00'}
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="space-y-1">
          <div className="text-sm">
            Last Sign In: 
          </div>
          <div className="text-xs text-gray-500">
            {formatDateTime(user.last_sign_in_at)}
          </div>
        </div>
      </TableCell>
    </>
  );
}
