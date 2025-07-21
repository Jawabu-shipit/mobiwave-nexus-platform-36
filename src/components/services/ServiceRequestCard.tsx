
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, Lock, DollarSign } from 'lucide-react';
import { ServiceRequestForm } from './ServiceRequestForm';

interface ServiceRequestCardProps {
  service: {
    id: string;
    service_name: string;
    service_type: string;
    description: string;
    setup_fee: number;
    monthly_fee: number;
    is_premium: boolean;
  };
  isActivated: boolean;
}

export function ServiceRequestCard({ service, isActivated }: ServiceRequestCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'ussd': return '📱';
      case 'shortcode': return '💬'; 
      case 'mpesa': return '💳';
      case 'email': return '📧';
      case 'whatsapp': return '💚';
      case 'servicedesk': return '🎫';
      case 'sms': return '📲';
      default: return '⚙️';
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className={`h-full transition-all duration-200 hover:shadow-lg ${
      isActivated ? 'border-green-200 bg-green-50' : 'border-gray-200'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getServiceIcon(service.service_type)}</span>
            <div>
              <CardTitle className="text-lg">{service.service_name}</CardTitle>
              {service.is_premium && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  Premium
                </Badge>
              )}
            </div>
          </div>
          {isActivated && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {service.description}
        </p>

        <div className="space-y-2">
          {service.setup_fee > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Setup Fee:</span>
              <span className="font-medium">{formatPrice(service.setup_fee)}</span>
            </div>
          )}
          {service.monthly_fee > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Monthly Fee:</span>
              <span className="font-medium">{formatPrice(service.monthly_fee)}/month</span>
            </div>
          )}
          {service.setup_fee === 0 && service.monthly_fee === 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Pricing:</span>
              <span className="font-medium text-green-600">Usage-based</span>
            </div>
          )}
        </div>

        <div className="pt-2">
          {isActivated ? (
            <Button variant="outline" className="w-full" disabled>
              <CheckCircle className="w-4 h-4 mr-2" />
              Service Activated
            </Button>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Request Access
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <ServiceRequestForm
                  serviceId={service.id}
                  serviceName={service.service_name}
                  serviceType={service.service_type}
                  onRequestSubmitted={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
