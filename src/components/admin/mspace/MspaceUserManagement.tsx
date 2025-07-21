import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  Download,
  Users,
  Database,
  UserPlus,
  DollarSign,
  Key,
} from "lucide-react";
import { useMspaceUsers } from "@/hooks/useMspaceUsers";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";
import { MspaceDashboardSimple } from "./MspaceDashboardSimple";

import { useAuth } from "@/hooks/useAuth";

export function MspaceUserManagement() {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    user: authUser,
    userRole,
  } = useAuth();

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <div className="text-xl font-semibold text-red-600 mb-2">
          You must be logged in to access Mspace User Management.
        </div>
        <div className="text-gray-600">
          Please log in as an admin to continue.
        </div>
      </div>
    );
  }

  const { users, isLoading, fetchAndSyncClients } = useMspaceUsers();

  const handleSyncClients = () => {
    fetchAndSyncClients.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Legacy Data Section */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Legacy Mspace Data</h3>
            <p className="text-sm text-muted-foreground">
              Historical client data and sync operations
            </p>
          </div>
          <Button
            onClick={handleSyncClients}
            disabled={isLoading || fetchAndSyncClients.isPending}
            variant="outline"
            size="sm"
          >
            {isLoading || fetchAndSyncClients.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Fetch & Sync Clients
          </Button>
        </div>

        {users && users.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {users.length} legacy clients | Last sync:{" "}
            {users[0]?.fetched_at
              ? new Date(users[0].fetched_at).toLocaleString()
              : "Never"}
          </div>
        )}
      </div>

      {/* Main Mspace Dashboard */}
      <MspaceDashboardSimple />
    </div>
  );
}
