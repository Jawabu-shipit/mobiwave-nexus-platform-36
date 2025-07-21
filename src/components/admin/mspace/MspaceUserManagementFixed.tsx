import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Settings } from "lucide-react";
import { MspaceResellerSystemWide } from "./MspaceResellerSystemWide";
import { useAuth } from "@/hooks/useAuth";

export function MspaceUserManagementFixed() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            MSpace User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This page uses <strong>system-wide MSpace credentials</strong>{" "}
              that you only need to configure once. All MSpace operations will
              use these shared credentials automatically.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* System-wide Reseller Management */}
      <MspaceResellerSystemWide />
    </div>
  );
}
