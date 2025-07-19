import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Key,
  CheckCircle,
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  Users,
  RefreshCw,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMspaceUsersFixed } from "@/hooks/useMspaceUsersFixed";
import { useAuth } from "@/components/auth/AuthProvider";

export const MspaceSystemSetup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    apiKey: "",
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const queryClient = useQueryClient();

  // Use the fixed hook to test connectivity
  const { users, isLoading, error, fetchAndSyncClients } =
    useMspaceUsersFixed();

  // Check if current user has MSpace credentials configured
  const { data: userCredentials, isLoading: isCheckingCredentials } = useQuery({
    queryKey: ["current-user-mspace-credentials"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("api_credentials")
        .select("*")
        .eq("user_id", user.id)
        .eq("service_name", "mspace")
        .eq("is_active", true)
        .single();

      return error ? null : data;
    },
  });

  // Save credentials mutation
  const saveCredentialsMutation = useMutation({
    mutationFn: async (credentials: { username: string; apiKey: string }) => {
      if (!credentials.username.trim() || !credentials.apiKey.trim()) {
        throw new Error("Username and API key are required");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First encrypt the API key
      const { data: encryptedData, error: encryptError } =
        await supabase.functions.invoke("encrypt-data", {
          body: { data: credentials.apiKey },
        });

      if (encryptError) {
        throw new Error(`Encryption failed: ${encryptError.message}`);
      }

      const credentialData = {
        service_name: "mspace",
        username: credentials.username,
        api_key_encrypted: encryptedData.encrypted,
        is_active: true,
        user_id: user.id,
        additional_config: {
          configured_at: new Date().toISOString(),
        },
      };

      if (userCredentials?.id) {
        // Update existing
        const { error } = await supabase
          .from("api_credentials")
          .update({
            ...credentialData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userCredentials.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("api_credentials")
          .insert(credentialData);

        if (error) throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      toast.success("MSpace credentials configured successfully!");
      queryClient.invalidateQueries({
        queryKey: ["current-user-mspace-credentials"],
      });
      setIsConfiguring(false);
      setFormData({ username: "", apiKey: "" });
    },
    onError: (error: any) => {
      toast.error(`Failed to save credentials: ${error.message}`);
    },
  });

  const handleSave = () => {
    saveCredentialsMutation.mutate(formData);
  };

  const startConfiguring = () => {
    setIsConfiguring(true);
    if (userCredentials) {
      setFormData({
        username: userCredentials.username,
        apiKey: "", // Don't show the encrypted API key
      });
    }
  };

  const isConfigured = !!userCredentials;
  const hasData = users.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            MSpace Integration Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>One-time setup:</strong> Configure your MSpace credentials
              once below. After setup, all reseller client operations will work
              automatically.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Status Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {isConfigured ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {isConfigured ? "Configured" : "Not Configured"}
                </p>
                {isConfigured && (
                  <p className="text-sm text-muted-foreground">
                    Username: {userCredentials.username}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Clients Found</p>
                <p className="text-lg font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : hasData ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-muted-foreground">
                  {error ? "Error" : hasData ? "Working" : "Ready"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Form */}
      {!isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle>Configure MSpace Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">MSpace Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your MSpace username"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">MSpace API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter your MSpace API key"
                  value={formData.apiKey}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, apiKey: e.target.value }))
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={
                saveCredentialsMutation.isPending ||
                !formData.username.trim() ||
                !formData.apiKey.trim()
              }
              className="w-full"
            >
              <Save className="h-4 w-4 mr-1" />
              {saveCredentialsMutation.isPending
                ? "Saving..."
                : "Save Credentials"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Update Configuration */}
      {isConfigured && isConfiguring && (
        <Card>
          <CardHeader>
            <CardTitle>Update MSpace Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">MSpace Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your MSpace username"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">MSpace API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter new API key (leave empty to keep current)"
                  value={formData.apiKey}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, apiKey: e.target.value }))
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={
                  saveCredentialsMutation.isPending || !formData.username.trim()
                }
              >
                <Save className="h-4 w-4 mr-1" />
                {saveCredentialsMutation.isPending ? "Updating..." : "Update"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsConfiguring(false);
                  setFormData({ username: "", apiKey: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test and Results */}
      {isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test & Load Clients</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={startConfiguring}>
                  <Settings className="h-4 w-4 mr-1" />
                  Update
                </Button>
                <Button
                  onClick={() => fetchAndSyncClients.mutate()}
                  disabled={fetchAndSyncClients.isPending || isLoading}
                >
                  {fetchAndSyncClients.isPending || isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Load Clients
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error.message}
                </AlertDescription>
              </Alert>
            )}

            {hasData && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">
                    Successfully loaded {users.length} clients
                  </span>
                </div>

                {users.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span className="font-medium">{user.client_name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {user.user_type.replace("_", " ")}
                      </Badge>
                      <span className="text-sm">
                        {user.balance.toLocaleString()} SMS
                      </span>
                    </div>
                  </div>
                ))}

                {users.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    ... and {users.length - 5} more clients
                  </p>
                )}
              </div>
            )}

            {!hasData && !error && !isLoading && isConfigured && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Click "Load Clients" to fetch your MSpace reseller clients
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
