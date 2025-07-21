import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  UserPlus,
  Mail,
  Phone,
  Key,
  User,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { MspaceUserEnhanced } from "@/hooks/useMspaceUsersEnhanced";

interface ApiCredential {
  id: string;
  service_name: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

interface ClientProfileFormData {
  email: string;
  phone: string;
  password: string;
  assignApiCredentials: boolean;
  selectedCredentialId?: string;
}

interface MspaceClientProfileCreatorProps {
  clients: MspaceUserEnhanced[];
  onRefresh: () => void;
}

export const MspaceClientProfileCreator: React.FC<
  MspaceClientProfileCreatorProps
> = ({ clients, onRefresh }) => {
  const [selectedClient, setSelectedClient] =
    useState<MspaceUserEnhanced | null>(null);
  const [formData, setFormData] = useState<ClientProfileFormData>({
    email: "",
    phone: "",
    password: "",
    assignApiCredentials: false,
  });
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  // Get available API credentials for assignment
  const { data: apiCredentials = [], isLoading: isLoadingCredentials } =
    useQuery({
      queryKey: ["api-credentials-available"],
      queryFn: async (): Promise<ApiCredential[]> => {
        const { data, error } = await supabase
          .from("api_credentials")
          .select("id, service_name, username, is_active, created_at")
          .eq("service_name", "mspace")
          .eq("is_active", true);

        if (error) throw error;
        return data || [];
      },
    });

  // Filter clients that don't have profiles yet
  const clientsWithoutProfiles = clients.filter(
    (client) => !client.profile_created,
  );
  const clientsWithProfiles = clients.filter(
    (client) => client.profile_created,
  );

  // Create user profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async ({
      client,
      profileData,
    }: {
      client: MspaceUserEnhanced;
      profileData: ClientProfileFormData;
    }) => {
      // Generate email if not provided
      const email =
        profileData.email || `${client.mspace_client_id}@mspace.local`;

      // Create auth user
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password: profileData.password,
          email_confirm: true,
          user_metadata: {
            mspace_client_id: client.mspace_client_id,
            client_name: client.client_name,
            user_type: "client",
            created_from_mspace: true,
          },
        });

      if (authError) {
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }

      const userId = authData.user.id;

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: client.client_name,
        email: email,
        phone: profileData.phone || null,
        user_type: "client",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(userId);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      // Assign API credentials if requested
      let credentialAssignmentResult = null;
      if (
        profileData.assignApiCredentials &&
        profileData.selectedCredentialId
      ) {
        const { error: credAssignError } = await supabase
          .from("api_credentials")
          .update({ user_id: userId })
          .eq("id", profileData.selectedCredentialId);

        if (credAssignError) {
          console.warn("Failed to assign API credentials:", credAssignError);
          credentialAssignmentResult = { error: credAssignError.message };
        } else {
          credentialAssignmentResult = { success: true };
        }
      }

      // Update MSpace client record
      const { error: clientUpdateError } = await supabase
        .from("mspace_reseller_clients")
        .update({
          profile_created: true,
          profile_user_id: userId,
          api_credentials_assigned:
            profileData.assignApiCredentials &&
            credentialAssignmentResult?.success,
          assigned_api_credential_id: profileData.assignApiCredentials
            ? profileData.selectedCredentialId
            : null,
          email: email,
          phone: profileData.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", client.id);

      if (clientUpdateError) {
        console.warn(
          "Failed to update MSpace client record:",
          clientUpdateError,
        );
      }

      return {
        user_id: userId,
        email,
        credential_assignment: credentialAssignmentResult,
      };
    },
    onSuccess: (data, variables) => {
      toast.success(
        `Profile created successfully for ${variables.client.client_name}!`,
      );
      setSelectedClient(null);
      setFormData({
        email: "",
        phone: "",
        password: "",
        assignApiCredentials: false,
      });
      onRefresh();
      queryClient.invalidateQueries({
        queryKey: ["api-credentials-available"],
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to create profile: ${error.message}`);
    },
  });

  // Bulk create profiles mutation
  const bulkCreateProfilesMutation = useMutation({
    mutationFn: async (selectedClients: MspaceUserEnhanced[]) => {
      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const client of selectedClients) {
        try {
          await createProfileMutation.mutateAsync({
            client,
            profileData: {
              email: `${client.mspace_client_id}@mspace.local`,
              phone: "",
              password: `mspace_${client.mspace_client_id}_${Date.now()}`,
              assignApiCredentials: false,
            },
          });
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`${client.client_name}: ${error.message}`);
        }
      }

      return results;
    },
    onSuccess: (results) => {
      toast.success(
        `Bulk creation completed: ${results.success} successful, ${results.failed} failed`,
      );
      if (results.errors.length > 0) {
        console.error("Bulk creation errors:", results.errors);
      }
      onRefresh();
    },
    onError: (error: any) => {
      toast.error(`Bulk creation failed: ${error.message}`);
    },
  });

  const handleCreateProfile = () => {
    if (!selectedClient) return;

    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsCreating(true);
    createProfileMutation.mutate({
      client: selectedClient,
      profileData: formData,
    });
    setIsCreating(false);
  };

  const generatePassword = () => {
    const password = `mspace_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    setFormData((prev) => ({ ...prev, password }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Client Profile Management</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {clientsWithoutProfiles.length} without profiles
          </Badge>
          <Badge variant="default">
            {clientsWithProfiles.length} with profiles
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {clientsWithoutProfiles.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Clients Without Profiles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {clientsWithProfiles.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Profiles Created
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {clients.filter((c) => c.api_credentials_assigned).length}
                </p>
                <p className="text-sm text-muted-foreground">
                  API Credentials Assigned
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {clientsWithoutProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Bulk Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={bulkCreateProfilesMutation.isPending}
                  >
                    Create All Profiles ({clientsWithoutProfiles.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Create Profiles for All Clients?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will create user profiles for{" "}
                      {clientsWithoutProfiles.length} clients without profiles.
                      Default emails will be generated as{" "}
                      {"{client_id}@mspace.local"} and random passwords will be
                      assigned.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        bulkCreateProfilesMutation.mutate(
                          clientsWithoutProfiles,
                        )
                      }
                    >
                      Create All Profiles
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clients Without Profiles */}
      {clientsWithoutProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Clients Without Profiles ({clientsWithoutProfiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clientsWithoutProfiles.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{client.client_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">
                          {client.user_type.replace("_", " ")}
                        </Badge>
                        <span>Balance: {client.balance}</span>
                        <span>
                          Synced:{" "}
                          {format(new Date(client.last_synced_at), "PPp")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => setSelectedClient(client)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Create Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Create Profile for {client.client_name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder={`${client.mspace_client_id}@mspace.local`}
                            value={formData.email}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone (Optional)</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+254..."
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="flex gap-2">
                            <Input
                              id="password"
                              type="password"
                              placeholder="Minimum 6 characters"
                              value={formData.password}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  password: e.target.value,
                                }))
                              }
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={generatePassword}
                            >
                              Generate
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="assignCredentials"
                              checked={formData.assignApiCredentials}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  assignApiCredentials: e.target.checked,
                                }))
                              }
                            />
                            <Label htmlFor="assignCredentials">
                              Assign API Credentials
                            </Label>
                          </div>

                          {formData.assignApiCredentials && (
                            <Select
                              value={formData.selectedCredentialId}
                              onValueChange={(value) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  selectedCredentialId: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select API Credential" />
                              </SelectTrigger>
                              <SelectContent>
                                {apiCredentials.map((cred) => (
                                  <SelectItem key={cred.id} value={cred.id}>
                                    {cred.username} ({cred.service_name})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedClient(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreateProfile}
                            disabled={isCreating || !formData.password}
                          >
                            Create Profile
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clients With Profiles */}
      {clientsWithProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Clients With Profiles ({clientsWithProfiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clientsWithProfiles.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{client.client_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">
                          {client.user_type.replace("_", " ")}
                        </Badge>
                        {client.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {client.api_credentials_assigned && (
                      <Badge
                        variant="default"
                        className="flex items-center gap-1"
                      >
                        <Key className="h-3 w-3" />
                        API Assigned
                      </Badge>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
