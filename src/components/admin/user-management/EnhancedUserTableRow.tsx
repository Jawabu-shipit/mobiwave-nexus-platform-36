
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database, Globe, User, Building2 } from 'lucide-react';
import { CombinedUser } from '@/hooks/useEnhancedUserManagement';
import { UserActions } from './UserActions';

interface EnhancedUserTableRowProps {
  user: CombinedUser;
  onUserUpdated: () => void;
}

export function EnhancedUserTableRow({ user, onUserUpdated }: EnhancedUserTableRowProps) {
  const getSourceIcon = (source: string) => {
    return source === 'database' ? Database : Globe;
  };

  const getTypeColor = (userType: string) => {
    switch (userType) {
      case 'real': return 'bg-green-100 text-green-800';
      case 'demo': return 'bg-blue-100 text-blue-800';
      case 'mspace_client': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderUserInfo = () => {
    if (user.source === 'mspace_api') {
      const mspaceUser = user as any;
      return (
        <div>
          <div className="font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            {mspaceUser.client_name}
          </div>
          <div className="text-sm text-gray-500">
            ID: {mspaceUser.mspace_client_id}
          </div>
        </div>
      );
    } else {
      const dbUser = user as any;
      return (
        <div>
          <div className="font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            {dbUser.first_name || dbUser.last_name 
              ? `${dbUser.first_name || ''} ${dbUser.last_name || ''}`.trim()
              : dbUser.email.split('@')[0]
            }
          </div>
          <div className="text-sm text-gray-500">{dbUser.email}</div>
        </div>
      );
    }
  };

  const renderContact = () => {
    if (user.source === 'mspace_api') {
      const mspaceUser = user as any;
      return (
        <div className="text-sm">
          {mspaceUser.email && <div>{mspaceUser.email}</div>}
          {mspaceUser.phone && <div>{mspaceUser.phone}</div>}
          {mspaceUser.username && <div className="text-gray-500">@{mspaceUser.username}</div>}
        </div>
      );
    } else {
      const dbUser = user as any;
      return <div className="text-sm">{dbUser.email}</div>;
    }
  };

  const renderRoleStatus = () => {
    if (user.source === 'mspace_api') {
      const mspaceUser = user as any;
      return (
        <Badge 
          variant={mspaceUser.status === 'active' ? 'default' : 'secondary'}
          className={mspaceUser.status === 'active' ? 'bg-green-100 text-green-800' : ''}
        >
          {mspaceUser.status}
        </Badge>
      );
    } else {
      const dbUser = user as any;
      return (
        <Badge 
          variant="secondary"
          className="bg-blue-100 text-blue-800"
        >
          {dbUser.role}
        </Badge>
      );
    }
  };

  const renderCreatedBalance = () => {
    if (user.source === 'mspace_api') {
      const mspaceUser = user as any;
      return (
        <div className="text-sm">
          <div className="font-medium text-green-600">${mspaceUser.balance.toFixed(2)}</div>
          <div className="text-gray-500">
            {mspaceUser.created_date 
              ? new Date(mspaceUser.created_date).toLocaleDateString()
              : 'Unknown'
            }
          </div>
        </div>
      );
    } else {
      const dbUser = user as any;
      return (
        <div className="text-sm text-gray-500">
          {new Date(dbUser.created_at).toLocaleDateString()}
        </div>
      );
    }
  };

  // Placeholder handlers for database users (Enhanced functionality not implemented yet)
  const handleEdit = () => {
    console.log('Edit user:', user.id);
    // TODO: Implement edit functionality for enhanced user management
  };

  const handleCredits = () => {
    console.log('Manage credits for user:', user.id);
    // TODO: Implement credits management for enhanced user management
  };

  const handleEmail = () => {
    console.log('Send email to user:', user.id);
    // TODO: Implement email functionality for enhanced user management
  };

  const handleDelete = () => {
    console.log('Delete user:', user.id);
    // TODO: Implement delete functionality for enhanced user management
  };

  const SourceIcon = getSourceIcon(user.source);

  return (
    <TableRow>
      <TableCell>
        {renderUserInfo()}
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col gap-1">
          <Badge className={getTypeColor(user.user_type)} variant="secondary">
            {user.user_type === 'mspace_client' ? 'Mspace Client' : user.user_type}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <SourceIcon className="w-3 h-3" />
            {user.source === 'database' ? 'Database' : 'Mspace API'}
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        {renderContact()}
      </TableCell>
      
      <TableCell>
        {renderRoleStatus()}
      </TableCell>
      
      <TableCell>
        {renderCreatedBalance()}
      </TableCell>
      
      <TableCell>
        {user.source === 'database' && (
          <UserActions
            onEdit={handleEdit}
            onCredits={handleCredits}
            onEmail={handleEmail}
            onDelete={handleDelete}
            isLoading={false}
          />
        )}
        {user.source === 'mspace_api' && (
          <Badge variant="outline" className="text-xs">
            Read-only
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
}
