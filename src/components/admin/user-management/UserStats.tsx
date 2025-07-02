
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserPlus, Shield, Ban } from 'lucide-react';

interface User {
  id: string;
  role?: string;
  status?: string;
}

interface UserStatsProps {
  users: User[];
}

export function UserStats({ users }: UserStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{users?.length || 0}</p>
            </div>
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Admins</p>
              <p className="text-3xl font-bold text-gray-900">
                {users?.filter(u => u.role === 'admin').length || 0}
              </p>
            </div>
            <Shield className="w-8 h-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Resellers</p>
              <p className="text-3xl font-bold text-gray-900">
                {users?.filter(u => u.role === 'reseller').length || 0}
              </p>
            </div>
            <Shield className="w-8 h-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Clients</p>
              <p className="text-3xl font-bold text-gray-900">
                {users?.filter(u => u.role === 'client').length || 0}
              </p>
            </div>
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
