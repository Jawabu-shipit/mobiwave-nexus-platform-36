
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import type { ServiceActivationRequest } from '@/types/serviceActivation';

interface RequestTableRowProps {
  request: ServiceActivationRequest;
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export function RequestTableRow({
  request,
  onApprove,
  onReject,
  isApproving,
  isRejecting
}: RequestTableRowProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium text-sm">
            {request.user?.email}
          </div>
          <div className="text-xs text-gray-500">
            {request.user?.first_name} {request.user?.last_name}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{request.service?.service_name}</div>
          <div className="text-xs text-gray-500 capitalize">
            {request.service?.service_type}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {getStatusIcon(request.status)}
          <Badge className={`text-xs ${getStatusColor(request.status)}`}>
            {request.status}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {new Date(request.requested_at).toLocaleDateString()}
        </div>
      </TableCell>
      <TableCell>
        {request.status === 'pending' && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => onApprove(request.id)}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject(request.id)}
              disabled={isRejecting}
            >
              Reject
            </Button>
          </div>
        )}
        {request.status === 'rejected' && request.rejection_reason && (
          <div className="text-xs text-red-600">
            {request.rejection_reason}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
