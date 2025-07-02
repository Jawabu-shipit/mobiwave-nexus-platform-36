
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { UserServiceActions } from '../UserServiceActions';

interface ServicesMatrixTableProps {
  groupedByUser: any[];
  allServices: any[];
  selectedUsers: string[];
  isUpdating: boolean;
  onSelectUser: (userId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onToggleService: (params: { userId: string; serviceId: string; operation: 'activate' | 'deactivate' }) => Promise<any>;
}

export function ServicesMatrixTable({
  groupedByUser,
  allServices,
  selectedUsers,
  isUpdating,
  onSelectUser,
  onSelectAll,
  onToggleService
}: ServicesMatrixTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selectedUsers.length === groupedByUser.length && groupedByUser.length > 0}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead>User</TableHead>
          {allServices.map((service) => (
            <TableHead key={service.id} className="text-center min-w-24">
              <div className="text-xs">
                <div className="font-medium">{service.service_name}</div>
                <div className="text-gray-500 capitalize">{service.service_type}</div>
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {groupedByUser.map((userGroup) => (
          <TableRow key={userGroup.user.id}>
            <TableCell>
              <Checkbox
                checked={selectedUsers.includes(userGroup.user.id)}
                onCheckedChange={(checked) => onSelectUser(userGroup.user.id, checked as boolean)}
              />
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium text-sm">{userGroup.user.email}</div>
                <div className="text-xs text-gray-500">
                  {userGroup.user.first_name} {userGroup.user.last_name}
                </div>
              </div>
            </TableCell>
            {allServices.map((service) => {
              const userService = userGroup.services?.find((s: any) => s.id === service.id);
              return (
                <TableCell key={service.id} className="text-center">
                  <UserServiceActions
                    userId={userGroup.user.id}
                    serviceId={service.id}
                    isActivated={userService?.is_activated || false}
                    isEligible={userService?.is_eligible !== false}
                    onToggle={onToggleService}
                    isLoading={isUpdating}
                  />
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
