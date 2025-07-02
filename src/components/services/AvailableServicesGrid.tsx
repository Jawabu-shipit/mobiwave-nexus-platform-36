
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceRequestCard } from './ServiceRequestCard';
import { useServiceAccess } from '@/hooks/useServiceAccess';

interface ServiceCatalog {
  id: string;
  service_name: string;
  service_type: string;
  description: string;
  setup_fee: number;
  monthly_fee: number;
  is_premium: boolean;
  is_active: boolean;
}

export function AvailableServicesGrid() {
  const { serviceAccess } = useServiceAccess();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services-catalog-available'],
    queryFn: async (): Promise<ServiceCatalog[]> => {
      const { data, error } = await supabase
        .from('services_catalog')
        .select('*')
        .eq('is_active', true)
        .order('service_name');

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Available Services</h2>
        <p className="text-gray-600">
          Request access to additional services based on your subscription plan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceRequestCard
            key={service.id}
            service={service}
            isActivated={serviceAccess[service.service_type] || false}
          />
        ))}
      </div>
    </div>
  );
}
