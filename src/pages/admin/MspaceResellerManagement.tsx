import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MspaceSyncManager } from "@/components/admin/mspace/MspaceSyncManager";
import { MspaceClientProfileCreator } from "@/components/admin/mspace/MspaceClientProfileCreator";
import { useMspaceUsersEnhanced } from "@/hooks/useMspaceUsersEnhanced";
import { RefreshCw, Database, Users, Settings, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export const MspaceResellerManagement: React.FC = () => {
  const {
    users: storedUsers,
    liveUsers,
    isLoading,
    isLoadingLive,
    recentSyncOps,
    stats,
    syncWithDatabase,
    scheduledSync,
  } = useMspaceUsersEnhanced();

  const handleRefresh = () => {
    syncWithDatabase.mutate();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MSpace Reseller Management</h1>
          <p className="text-muted-foreground">
            Manage MSpace reseller clients, sync data, and create user profiles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {stats.totalClients} Clients in DB
          </Badge>
          {recentSyncOps[0] && (
            <Badge
              variant={
                recentSyncOps[0].operation_status === "completed"
                  ? "default"
                  : "destructive"
              }
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Last Sync:{" "}
              {format(new Date(recentSyncOps[0].initiated_at), "PPp")}
            </Badge>
          )}
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
                <p className="text-sm text-muted-foreground">Total Clients</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {stats.resellerClients} resellers • {stats.subAccounts}{" "}
              sub-accounts
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.syncedRecently}</p>
                <p className="text-sm text-muted-foreground">Recently Synced</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Within last hour
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.profilesCreated}</p>
                <p className="text-sm text-muted-foreground">
                  Profiles Created
                </p>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {((stats.profilesCreated / stats.totalClients) * 100).toFixed(1)}%
              completion
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.credentialsAssigned}
                </p>
                <p className="text-sm text-muted-foreground">API Credentials</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Assigned to clients
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="sync" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync Management
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Profile Creation
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview & Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sync" className="space-y-4">
          <MspaceSyncManager />
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <MspaceClientProfileCreator
            clients={storedUsers}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Balance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Balance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {storedUsers
                          .reduce((sum, user) => sum + user.balance, 0)
                          .toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Balance
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {(
                          storedUsers.reduce(
                            (sum, user) => sum + user.balance,
                            0,
                          ) / stats.totalClients || 0
                        ).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Average Balance
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Top Clients by Balance</h4>
                    {storedUsers
                      .sort((a, b) => b.balance - a.balance)
                      .slice(0, 5)
                      .map((client) => (
                        <div
                          key={client.id}
                          className="flex justify-between items-center py-2 border-b"
                        >
                          <span className="font-medium">
                            {client.client_name}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {client.user_type.replace("_", " ")}
                            </Badge>
                            <span className="font-bold">
                              {client.balance.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sync Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sync Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSyncOps.length > 0 ? (
                    recentSyncOps.slice(0, 5).map((operation) => (
                      <div
                        key={operation.id}
                        className="flex justify-between items-center py-2 border-b"
                      >
                        <div>
                          <p className="font-medium">
                            {operation.operation_type.replace("_", " ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(operation.initiated_at), "PPp")}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              operation.operation_status === "completed"
                                ? "default"
                                : operation.operation_status === "failed"
                                  ? "destructive"
                                  : operation.operation_status === "partial"
                                    ? "secondary"
                                    : "outline"
                            }
                          >
                            {operation.operation_status}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {operation.successful_syncs}/
                            {operation.total_clients_processed} successful
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No sync operations found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Creation Status */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Profile Creation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">
                      {stats.profilesCreated}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Profiles Created
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-3xl font-bold text-orange-600">
                      {stats.totalClients - stats.profilesCreated}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pending Profiles
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.credentialsAssigned}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      API Credentials Assigned
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Profile Creation Progress</span>
                    <span>
                      {(
                        (stats.profilesCreated / stats.totalClients) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(stats.profilesCreated / stats.totalClients) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MspaceResellerManagement;
