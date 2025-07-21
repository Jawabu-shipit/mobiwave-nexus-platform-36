
import { useState } from 'react';
import { toast } from 'sonner';

export const useServiceConfiguration = () => {
  const [configuration, setConfiguration] = useState<any>({});
  const [isConfiguring, setIsConfiguring] = useState(false);

  const updateConfiguration = (key: string, value: any) => {
    setConfiguration((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const resetConfiguration = () => {
    setConfiguration({});
  };

  const saveConfiguration = async (
    serviceId: string,
    config: any,
    onServiceConfigured: (serviceId: string, configuration: any) => Promise<void>
  ): Promise<boolean> => {
    setIsConfiguring(true);
    try {
      await onServiceConfigured(serviceId, config);
      toast.success('Service configuration saved successfully');
      resetConfiguration();
      return true;
    } catch (error: any) {
      toast.error(`Failed to save configuration: ${error.message}`);
      return false;
    } finally {
      setIsConfiguring(false);
    }
  };

  return {
    configuration,
    isConfiguring,
    updateConfiguration,
    resetConfiguration,
    saveConfiguration
  };
};
