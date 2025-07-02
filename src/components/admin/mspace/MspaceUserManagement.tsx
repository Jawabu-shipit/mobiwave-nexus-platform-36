
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Download, Users, Database, UserPlus, DollarSign } from 'lucide-react';
import { useMspaceUsers } from '@/hooks/useMspaceUsers';
import { LoadingWrapper } from '@/components/ui/loading-wrapper';
import { SubUsersManager } from './SubUsersManager';
import { MspaceCreditsManager } from './MspaceCreditsManager';

export function MspaceUserManagement() {
  const { 
    users, 
    isLoading, 
    fetchAndSyncClients
  } = useMspaceUsers();

  const handleSyncClients = () => {
    fetchAndSyncClients.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Mspace Management</h3>
          <p className="text-gray-600">Manage Mspace API clients, credits, and reseller operations</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleSyncClients}
            disabled={isLoading || fetchAndSyncClients.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading || fetchAndSyncClients.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Fetch & Sync Clients
          </Button>
        </div>
      </div>

      <Tabs defaultValue="credits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Credits Management
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Mspace Clients
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Sub Accounts & Reseller Clients
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credits" className="space-y-6">
          <MspaceCreditsManager />
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Total Mspace Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users?.length || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="w-4 h-4 text-green-600" />
                  Active Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users?.filter(u => u.status === 'active').length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-purple-600" />
                  Last Sync
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {users?.[0]?.fetched_at 
                    ? new Date(users[0].fetched_at).toLocaleString()
                    : 'Never'
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Mspace Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LoadingWrapper isLoading={isLoading}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-sm">{user.mspace_client_id}</TableCell>
                        <TableCell className="font-medium">{user.client_name}</TableCell>
                        <TableCell>{user.username || '-'}</TableCell>
                        <TableCell>{user.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            ${user.balance.toFixed(2)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className={user.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.last_login 
                            ? new Date(user.last_login).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {!users?.length && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No Mspace clients found. Click "Fetch & Sync Clients" to load data.</p>  
                  </div>
                )}
              </LoadingWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <SubUsersManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
