
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from 'lucide-react';
import { ServiceCard } from './ServiceCard';
import { SecureServiceEditDialog } from './SecureServiceEditDialog';
import { useSecureServiceOperations } from '@/hooks/useSecureServiceOperations';

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

interface ServiceCatalogViewProps {
  services: ServiceCatalog[];
  isLoading: boolean;
}

export function ServiceCatalogView({ services, isLoading }: ServiceCatalogViewProps) {
  const [editingService, setEditingService] = useState<ServiceCatalog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { updateService, toggleServiceStatus, isUpdating } = useSecureServiceOperations();

  const handleEditService = (service: ServiceCatalog) => {
    setEditingService(service);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingService(null);
  };

  const handleSaveService = async (service: ServiceCatalog) => {
    try {
      await updateService(service);
      handleCloseEditDialog();
    } catch (error) {
      console.error('Failed to update service:', error);
    }
  };

  const handleToggleServiceStatus = async (serviceId: string, isActive: boolean) => {
    try {
      await toggleServiceStatus({ serviceId, isActive });
    } catch (error) {
      console.error('Failed to toggle service status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Available Services Catalog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceCard 
                key={service.id} 
                service={service}
                onEdit={handleEditService}
                onToggleStatus={handleToggleServiceStatus}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <SecureServiceEditDialog
        service={editingService}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSaveService}
        isLoading={isUpdating}
      />
    </>
  );
}
