
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RequestTableRow } from './RequestTableRow';
import type { ServiceActivationRequest } from '@/types/serviceActivation';

interface RequestsTableProps {
  requests: ServiceActivationRequest[];
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export function RequestsTable({
  requests,
  onApprove,
  onReject,
  isApproving,
  isRejecting
}: RequestsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Requested</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <RequestTableRow
            key={request.id}
            request={request}
            onApprove={onApprove}
            onReject={onReject}
            isApproving={isApproving}
            isRejecting={isRejecting}
          />
        ))}
      </TableBody>
    </Table>
  );
}
