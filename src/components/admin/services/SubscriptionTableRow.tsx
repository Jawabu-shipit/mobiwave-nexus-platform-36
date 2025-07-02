
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from './StatusBadge';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface UserServiceSubscription {
  id: string;
  user_id: string;
  service_id: string;
  status: string;
  configuration: any;
  setup_fee_paid: boolean;
  monthly_billing_active: boolean;
  activated_at: string;
  service: {
    id: string;
    service_name: string;
    service_type: string;
  };
}

interface SubscriptionTableRowProps {
  subscription: UserServiceSubscription;
  user?: User;
  isUpdating: boolean;
  onToggleServiceStatus: (subscriptionId: string, newStatus: string) => Promise<void>;
}

export function SubscriptionTableRow({ 
  subscription, 
  user, 
  isUpdating, 
  onToggleServiceStatus 
}: SubscriptionTableRowProps) {
  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'ussd': return '📱';
      case 'shortcode': return '💬';
      case 'mpesa': return '💳';
      case 'survey': return '📊';
      case 'servicedesk': return '🎫';
      case 'rewards': return '🎁';
      case 'whatsapp': return '💚';
      default: return '⚙️';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium text-sm">
            {user?.email || 'Unknown User'}
          </div>
          <div className="text-xs text-gray-500">
            ID: {subscription.user_id.slice(0, 8)}...
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-lg">{getServiceIcon(subscription.service.service_type)}</span>
          <div>
            <div className="font-medium text-sm">{subscription.service.service_name}</div>
            <div className="text-xs text-gray-500">{subscription.service.service_type}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={subscription.status} />
      </TableCell>
      <TableCell>
        <div className="text-xs">
          <div>Setup: {subscription.setup_fee_paid ? '✓ Paid' : '✗ Pending'}</div>
          <div>Monthly: {subscription.monthly_billing_active ? '✓ Active' : '✗ Inactive'}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={subscription.status === 'active'}
            onCheckedChange={async (checked) => {
              await onToggleServiceStatus(
                subscription.id,
                checked ? 'active' : 'suspended'
              );
            }}
            disabled={isUpdating}
          />
          <Button size="sm" variant="outline">
            Configure
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
