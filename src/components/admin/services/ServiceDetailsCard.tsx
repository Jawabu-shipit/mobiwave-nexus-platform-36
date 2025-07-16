
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingDisplay } from './PricingDisplay';

interface ServiceCatalog {
  id: string;
  service_name: string;
  service_type: string;
  description: string;
  setup_fee: number;
  monthly_fee: number;
  transaction_fee_type: string;
  transaction_fee_amount: number;
  is_premium: boolean;
  is_active: boolean;
  provider: string;
}

interface ServiceDetailsCardProps {
  service: ServiceCatalog;
}

export function ServiceDetailsCard({ service }: ServiceDetailsCardProps) {
  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'ussd': return '📱';
      case 'shortcode': return '💬';
      case 'mpesa': return '💳';
      case 'survey': return '📊';
      case 'servicedesk': return '🎫';
      case 'rewards': return '🎁';
      case 'whatsapp': return '💚';
      case 'sms': return '📧';
      default: return '⚙️';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{getServiceIcon(service.service_type)}</span>
          <div>
            <h3 className="text-lg">{service.service_name}</h3>
            <p className="text-sm text-gray-500 capitalize font-normal">{service.service_type}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">{service.description}</p>
        
        <PricingDisplay
          setupFee={service.setup_fee}
          monthlyFee={service.monthly_fee}
          transactionFeeType={service.transaction_fee_type}
          transactionFeeAmount={service.transaction_fee_amount}
        />

        <div className="flex gap-2">
          <Badge variant={service.is_active ? "default" : "secondary"}>
            {service.is_active ? 'Active' : 'Inactive'}
          </Badge>
          {service.is_premium && (
            <Badge variant="outline">Premium</Badge>
          )}
          <Badge variant="outline">{service.provider}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
