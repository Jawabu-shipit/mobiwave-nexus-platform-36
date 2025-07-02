
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingWrapper } from '@/components/ui/loading-wrapper';
import { Users } from 'lucide-react';

interface SubUser {
  smsBalance: string;
  subAccUser: string;
}

interface ResellerClient {
  clientname: string;
  balance: string;
  status?: string;
}

interface UsersTableProps {
  subUsers: SubUser[];
  resellerClients: ResellerClient[];
  isLoading: boolean;
  onTopUp: (clientname: string, type: string) => void;
}

export function UsersTable({ subUsers, resellerClients, isLoading, onTopUp }: UsersTableProps) {
  return (
    <>
      {/* Sub Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sub Users ({subUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingWrapper isLoading={isLoading && subUsers.length === 0}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>SMS Balance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subUsers.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{user.subAccUser}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {parseInt(user.smsBalance).toLocaleString()} SMS
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onTopUp(user.subAccUser, 'subAccount')}
                      >
                        Top Up
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {subUsers.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No sub users found. Click "Refresh" to load data.</p>
              </div>
            )}
          </LoadingWrapper>
        </CardContent>
      </Card>

      {/* Reseller Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Reseller Clients ({resellerClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingWrapper isLoading={isLoading && resellerClients.length === 0}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resellerClients.map((client, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{client.clientname}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {parseInt(client.balance || '0').toLocaleString()} SMS
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onTopUp(client.clientname, 'resellerClient')}
                      >
                        Top Up
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {resellerClients.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No reseller clients found. Click "Refresh" to load data.</p>
              </div>
            )}
          </LoadingWrapper>
        </CardContent>
      </Card>
    </>
  );
}
