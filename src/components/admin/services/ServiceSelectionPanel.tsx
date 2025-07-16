
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings } from 'lucide-react';

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

interface ServiceSelectionPanelProps {
  services: ServiceCatalog[];
  selectedService: ServiceCatalog | null;
  onServiceSelect: (service: ServiceCatalog) => void;
}

export function ServiceSelectionPanel({
  services,
  selectedService,
  onServiceSelect
}: ServiceSelectionPanelProps) {
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
          <Settings className="w-5 h-5" />
          Available Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {services.map((service) => (
          <div
            key={service.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedService?.id === service.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onServiceSelect(service)}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{getServiceIcon(service.service_type)}</span>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{service.service_name}</h4>
                <p className="text-xs text-gray-500 capitalize">{service.service_type}</p>
              </div>
              {service.is_premium && (
                <Badge variant="outline" className="text-xs">Premium</Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
