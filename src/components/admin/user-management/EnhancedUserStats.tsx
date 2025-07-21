
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Database, Globe } from 'lucide-react';

interface EnhancedUserStatsProps {
  stats: {
    total: number;
    real: number;
    demo: number;
    mspace: number;
    database: number;
  };
}

export function EnhancedUserStats({ stats }: EnhancedUserStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
            <Users className="w-4 h-4" />
            Total Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
            <UserCheck className="w-4 h-4" />
            Real Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900">{stats.real}</div>
          <div className="text-xs text-green-600">Admins + Mspace</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-700">
            <UserX className="w-4 h-4" />
            Demo Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-900">{stats.demo}</div>
          <div className="text-xs text-yellow-600">Test accounts</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700">
            <Globe className="w-4 h-4" />
            Mspace Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-900">{stats.mspace}</div>
          <div className="text-xs text-purple-600">API clients</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
            <Database className="w-4 h-4" />
            Database Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{stats.database}</div>
          <div className="text-xs text-gray-600">Local accounts</div>
        </CardContent>
      </Card>
    </div>
  );
}
