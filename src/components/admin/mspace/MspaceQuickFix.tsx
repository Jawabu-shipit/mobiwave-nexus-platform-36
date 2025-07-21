import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, CheckCircle, AlertCircle, Users, Info } from "lucide-react";
import { useMspaceUsersFixed } from "@/hooks/useMspaceUsersFixed";

export const MspaceQuickFix: React.FC = () => {
  const { users, isLoading, error, fetchAndSyncClients } =
    useMspaceUsersFixed();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MSpace Quick Fix Test</h2>
          <p className="text-muted-foreground">
            Testing the fixed MSpace integration
          </p>
        </div>
        <Button
          onClick={() => fetchAndSyncClients.mutate()}
          disabled={fetchAndSyncClients.isPending || isLoading}
        >
          {fetchAndSyncClients.isPending || isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Test Fetch
        </Button>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              ) : error ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Loading..." : error ? "Error" : "Ready"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="font-medium">Clients Found</p>
                <p className="text-lg font-bold">{users.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-purple-500" />
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {users.length > 0 ? "Just now" : "Never"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {!error && !isLoading && users.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No MSpace clients found. This could mean:
            <ul className="list-disc ml-4 mt-2">
              <li>MSpace API credentials are not configured</li>
              <li>Your MSpace account has no reseller clients</li>
              <li>There's a configuration issue</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Users List */}
      {users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>MSpace Clients ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.slice(0, 10).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{user.client_name}</p>
                    <p className="text-sm text-muted-foreground">
                      ID: {user.mspace_client_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {user.balance.toLocaleString()} SMS
                    </p>
                    <Badge variant="outline">
                      {user.user_type.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
              {users.length > 10 && (
                <p className="text-center text-sm text-muted-foreground py-2">
                  ... and {users.length - 10} more clients
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Loading State:</span>
              <Badge variant={isLoading ? "default" : "secondary"}>
                {isLoading ? "Loading" : "Idle"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Error State:</span>
              <Badge variant={error ? "destructive" : "default"}>
                {error ? "Has Error" : "No Error"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Users Count:</span>
              <span>{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Reseller Clients:</span>
              <span>
                {users.filter((u) => u.user_type === "reseller_client").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Sub Accounts:</span>
              <span>
                {users.filter((u) => u.user_type === "sub_account").length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
