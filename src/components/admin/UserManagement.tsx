import React, { useState } from 'react';
import { LoadingWrapper } from '@/components/ui/loading-wrapper';
import { useCompleteUserManagement } from '@/hooks/useCompleteUserManagement';
import { CompleteUserStats } from './user-management/CompleteUserStats';
import { EnhancedUserFilters } from './user-management/EnhancedUserFilters';
import { CompleteUserTable } from './user-management/CompleteUserTable';
import { MspaceUserManagement } from './mspace/MspaceUserManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Globe, AlertTriangle, Shield } from 'lucide-react';
import { UserRoleManager } from './user-management/UserRoleManager';
import { AdminContactsBulkActions } from './users/AdminContactsBulkActions';
import ApiCredentialsTab from './user-management/tabs/ApiCredentialsTab';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  const { users, isLoading, stats, refetch } = 
  useCompleteUserManagement(searchTerm, roleFilter, userTypeFilter);

  const handleUserUpdated = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent">
          Comprehensive User Management
        </h2>
        <div className="flex items-center gap-2">
          <p className="text-lg text-gray-600 max-w-2xl">
            Advanced user management including auth users, profiles, Mspace clients, service activations, and automated profile creation.
          </p>
          {stats.without_profiles > 0 && (
            <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-sm">
              <AlertTriangle className="w-4 h-4" />
              {stats.without_profiles} users missing profiles
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            All Users ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="mspace" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Mspace Management
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Role Management
          </TabsTrigger>
          <TabsTrigger value="api-credentials" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            API Credentials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <AdminContactsBulkActions 
            selectedContacts={selectedUsers}
            onClearSelection={() => setSelectedUsers([])}
            onRefresh={refetch}
          />
          
          <CompleteUserStats stats={stats} />
          
          <EnhancedUserFilters 
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            userTypeFilter={userTypeFilter}
            onSearchChange={setSearchTerm}
            onRoleFilterChange={setRoleFilter}
            onUserTypeFilterChange={setUserTypeFilter}
          />

          <LoadingWrapper 
            isLoading={isLoading} 
            fallback={
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            }
          >
            <CompleteUserTable 
              users={users}
              isLoading={isLoading}
              onUserUpdated={handleUserUpdated}
            />
          </LoadingWrapper>
        </TabsContent>

        <TabsContent value="mspace" className="space-y-6">
          <MspaceUserManagement />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Manage User Roles</h3>
            <p className="text-gray-500 mb-4">
              Assign or revoke roles for users. Only admins can perform these actions.
            </p>
            <React.Suspense fallback={<div>Loading roles...</div>}>
              <UserRoleManager />
            </React.Suspense>
          </div>
        </TabsContent>
        <TabsContent value="api-credentials" className="space-y-6">
          <ApiCredentialsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
