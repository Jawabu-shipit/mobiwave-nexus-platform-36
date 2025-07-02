
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users } from 'lucide-react';

interface SubUser {
  smsBalance: string;
  subAccUser: string;
}

interface ResellerClient {
  clientname: string;
  balance: string;
  status?: string;
}

interface SummaryCardsProps {
  subUsers: SubUser[];
  resellerClients: ResellerClient[];
}

export function SummaryCards({ subUsers, resellerClients }: SummaryCardsProps) {
  const totalSubUserBalance = subUsers.reduce((sum, user) => sum + parseInt(user.smsBalance || '0'), 0);
  const totalResellerBalance = resellerClients.reduce((sum, client) => sum + parseInt(client.balance || '0'), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Sub Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{subUsers.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            Sub User Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSubUserBalance.toLocaleString()}</div>
          <p className="text-xs text-gray-500">SMS Credits</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            Reseller Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resellerClients.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-600" />
            Reseller Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalResellerBalance.toLocaleString()}</div>
          <p className="text-xs text-gray-500">SMS Credits</p>
        </CardContent>
      </Card>
    </div>
  );
}
