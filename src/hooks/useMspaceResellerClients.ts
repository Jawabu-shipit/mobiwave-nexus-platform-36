
import { useMspaceApi } from './useMspaceApi';

interface ResellerClient {
  clientUserName: string;
  smsBalance: string;
}

export const useMspaceResellerClients = () => {
  // Use the centralized API hook to get reseller clients
  const { getResellerClients } = useMspaceApi();

  return { 
    getResellerClients, 
    isLoading: getResellerClients.isPending 
  };
};
