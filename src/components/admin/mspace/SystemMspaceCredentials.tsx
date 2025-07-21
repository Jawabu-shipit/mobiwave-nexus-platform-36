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
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SystemCredentials {
  id: string;
  service_name: string;
  username: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const SystemMspaceCredentials: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    apiKey: "",
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Get current system credentials
  const { data: systemCredentials, isLoading } = useQuery({
    queryKey: ["system-mspace-credentials"],
    queryFn: async (): Promise<SystemCredentials | null> => {
      // Use a special system user ID for system-wide credentials
      const { data, error } = await supabase
        .from("api_credentials")
        .select("*")
        .eq("service_name", "mspace_system")
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching system credentials:", error);
        return null;
      }

      return data;
    },
  });

  // Save system credentials mutation
  const saveCredentialsMutation = useMutation({
    mutationFn: async (credentials: { username: string; apiKey: string }) => {
      if (!credentials.username.trim() || !credentials.apiKey.trim()) {
        throw new Error("Username and API key are required");
      }

      // First encrypt the API key
      const { data: encryptedData, error: encryptError } =
        await supabase.functions.invoke("encrypt-data", {
          body: { data: credentials.apiKey },
        });

      if (encryptError) {
        throw new Error(`Encryption failed: ${encryptError.message}`);
      }

      const credentialData = {
        service_name: "mspace_system",
        username: credentials.username,
        api_key_encrypted: encryptedData.encrypted,
        is_active: true,
        user_id: null, // System-wide, not tied to a specific user
        additional_config: {
          system_wide: true,
          configured_at: new Date().toISOString(),
          configured_by: (await supabase.auth.getUser()).data.user?.email,
        },
      };

      if (systemCredentials?.id) {
        // Update existing
        const { error } = await supabase
          .from("api_credentials")
          .update({
            ...credentialData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", systemCredentials.id);

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
      toast.success("System MSpace credentials saved successfully!");
      queryClient.invalidateQueries({
        queryKey: ["system-mspace-credentials"],
      });
      setIsEditing(false);
      setFormData({ username: "", apiKey: "" });
    },
    onError: (error: any) => {
      toast.error(`Failed to save credentials: ${error.message}`);
    },
  });

  // Test credentials mutation
  const testCredentialsMutation = useMutation({
    mutationFn: async () => {
      if (!systemCredentials) {
        throw new Error("No system credentials configured");
      }

      // Test by calling the balance endpoint
      const { data, error } = await supabase.functions.invoke(
        "mspace-balance",
        {
          body: { useSystemCredentials: true },
        },
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `Credentials work! Current balance: ${data.balance || "Unknown"}`,
      );
    },
    onError: (error: any) => {
      toast.error(`Credential test failed: ${error.message}`);
    },
  });

  const handleSave = () => {
    saveCredentialsMutation.mutate(formData);
  };

  const startEditing = () => {
    setIsEditing(true);
    if (systemCredentials) {
      setFormData({
        username: systemCredentials.username,
        apiKey: "", // Don't show the encrypted API key
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System MSpace Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {systemCredentials ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="font-medium">
                {systemCredentials ? "Configured" : "Not Configured"}
              </p>
              {systemCredentials && (
                <p className="text-sm text-muted-foreground">
                  Username: {systemCredentials.username}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {systemCredentials && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => testCredentialsMutation.mutate()}
                disabled={testCredentialsMutation.isPending}
              >
                <Key className="h-4 w-4 mr-1" />
                Test
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Settings className="h-4 w-4 mr-1" />
              {systemCredentials ? "Update" : "Configure"}
            </Button>
          </div>
        </div>

        {/* Configuration Form */}
        {isEditing && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
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

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={
                  saveCredentialsMutation.isPending ||
                  !formData.username.trim() ||
                  !formData.apiKey.trim()
                }
              >
                <Save className="h-4 w-4 mr-1" />
                {saveCredentialsMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ username: "", apiKey: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Information */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>System-wide Configuration:</strong> These credentials will
            be used for all MSpace operations across the platform. Once
            configured, you won't need to enter them again.
          </AlertDescription>
        </Alert>

        {/* Status Details */}
        {systemCredentials && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label>Status</Label>
              <div className="flex items-center gap-1 mt-1">
                <Badge
                  variant={
                    systemCredentials.is_active ? "default" : "destructive"
                  }
                >
                  {systemCredentials.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div>
              <Label>Last Updated</Label>
              <p className="mt-1">
                {new Date(systemCredentials.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
