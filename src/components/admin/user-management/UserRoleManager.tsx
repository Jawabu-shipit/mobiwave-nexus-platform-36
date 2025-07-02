
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
}

export function UserRoleManager() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["rolemanager-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, full_name");
      
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      
      return (data || []).map(user => ({
        id: user.id,
        email: user.email || '',
        first_name: user.first_name || undefined,
        last_name: user.last_name || undefined,
        full_name: user.full_name || undefined
      })) as User[];
    },
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["rolemanager-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("id, name, description");
      
      if (error) {
        console.error('Error fetching roles:', error);
        return [];
      }
      
      return (data || []) as Role[];
    }
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ["rolemanager-user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      return (data || []) as UserRole[];
    }
  });

  const assignRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string, roleId: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role_id: roleId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["rolemanager-user_roles"] });
    },
    onError: (err: any) => toast.error("Failed to assign role: " + err.message),
  });

  const revokeRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string, roleId: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role_id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role revoked successfully");
      queryClient.invalidateQueries({ queryKey: ["rolemanager-user_roles"] });
    },
    onError: (err: any) => toast.error("Failed to revoke role: " + err.message),
  });

  if (usersLoading || rolesLoading) {
    return <div className="p-6 text-center">Loading role management...</div>;
  }

  const getUserDisplayName = (user: User) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    if (user.full_name) {
      return user.full_name;
    }
    return user.email;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Role Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Assigned Roles</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const rolesForUser = userRoles.filter((ur) => ur.user_id === user.id);
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    {getUserDisplayName(user)}
                  </TableCell>
                  <TableCell>
                    {rolesForUser.length === 0 && <span className="text-gray-400">No roles</span>}
                    {rolesForUser.map((ur) => {
                      const roleObj = roles.find((r) => r.id === ur.role_id);
                      return (
                        <Badge key={ur.role_id} className="mr-2">
                          {roleObj?.name || ur.role_id}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="ml-1 p-0 h-4 w-4"
                            onClick={() => revokeRole.mutate({ userId: user.id, roleId: ur.role_id })}
                            title="Revoke"
                          >✕</Button>
                        </Badge>
                      );
                    })}
                  </TableCell>
                  <TableCell>
                    <select
                      value=""
                      onChange={(e) => assignRole.mutate({ userId: user.id, roleId: e.target.value })}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">Assign role...</option>
                      {roles.map((role) => (
                        !rolesForUser.some((ur) => ur.role_id === role.id) && (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        )
                      ))}
                    </select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
