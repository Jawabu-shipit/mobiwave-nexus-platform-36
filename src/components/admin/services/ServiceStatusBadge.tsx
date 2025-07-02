
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface ServiceStatusBadgeProps {
  status: string;
  isEligible: boolean;
}

export function ServiceStatusBadge({ status, isEligible }: ServiceStatusBadgeProps) {
  if (!isEligible) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
        <XCircle className="w-3 h-3 mr-1" />
        Not Eligible
      </Badge>
    );
  }

  switch (status) {
    case 'active':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    case 'subscribed':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
          <Clock className="w-3 h-3 mr-1" />
          Subscribed
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case 'available':
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
          Available
        </Badge>
      );
  }
}
