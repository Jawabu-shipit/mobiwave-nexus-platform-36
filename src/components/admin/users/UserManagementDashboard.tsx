
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Shield, TrendingUp } from 'lucide-react';
import { UserStatsOverview } from './UserStatsOverview';
import { UserSearchAndFilters } from './UserSearchAndFilters';
import { UserBulkActions } from './UserBulkActions';
import { UserDataTable } from './UserDataTable';
import { UserActivityFeed } from './UserActivityFeed';

export function UserManagementDashboard() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-gray-600">
            Manage users, roles, permissions, and monitor system activity.
          </p>
        </div>
      </div>

      <UserStatsOverview />

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserSearchAndFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
          
          {selectedUsers.length > 0 && (
            <UserBulkActions
              selectedUsers={selectedUsers}
              onClearSelection={() => setSelectedUsers([])}
            />
          )}

          <UserDataTable
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            statusFilter={statusFilter}
            selectedUsers={selectedUsers}
            onSelectUsers={setSelectedUsers}
          />
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Role Management</h3>
              <p className="text-gray-600">
                Advanced role and permission management coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <UserActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
