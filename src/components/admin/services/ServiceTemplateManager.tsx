
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Copy, Edit, Trash2 } from 'lucide-react';

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

interface ServiceTemplateManagerProps {
  services: ServiceCatalog[];
}

export function ServiceTemplateManager({ services }: ServiceTemplateManagerProps) {
  const templates = [
    {
      id: '1',
      name: 'Basic SMS Service',
      description: 'Standard SMS service template with basic configuration',
      service_type: 'sms',
      configuration: {
        monthly_fee: 5000,
        setup_fee: 2000,
        transaction_fee_type: 'fixed',
        transaction_fee_amount: 1
      }
    },
    {
      id: '2',
      name: 'Premium USSD Application',
      description: 'Full-featured USSD application with menu structure',
      service_type: 'ussd',
      configuration: {
        monthly_fee: 15000,
        setup_fee: 25000,
        transaction_fee_type: 'none',
        transaction_fee_amount: 0
      }
    },
    {
      id: '3',
      name: 'M-Pesa Integration',
      description: 'Standard M-Pesa payment integration',
      service_type: 'mpesa',
      configuration: {
        monthly_fee: 8000,
        setup_fee: 10000,
        transaction_fee_type: 'percentage',
        transaction_fee_amount: 2.5
      }
    }
  ];

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Service Templates</h3>
          <p className="text-gray-600">
            Pre-configured service templates for quick deployment
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Wrench className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getServiceIcon(template.service_type)}</span>
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="outline" className="text-xs capitalize">
                    {template.service_type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Setup Fee:</span>
                  <span>KES {template.configuration.setup_fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly Fee:</span>
                  <span>KES {template.configuration.monthly_fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction Fee:</span>
                  <span>
                    {template.configuration.transaction_fee_type === 'none' 
                      ? 'None' 
                      : `${template.configuration.transaction_fee_amount}${template.configuration.transaction_fee_type === 'percentage' ? '%' : ' KES'}`
                    }
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1">
                  <Copy className="w-3 h-3 mr-1" />
                  Use Template
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
