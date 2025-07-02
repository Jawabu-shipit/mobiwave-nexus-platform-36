
import { useState, useEffect } from 'react';
import { useMspaceApi } from '../useMspaceApi';
import { useMspaceReliability } from './useMspaceReliability';

interface ConnectionStatus {
  isConnected: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  balance: number | null;
  error: string | null;
}

export const useMspaceConnection = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isChecking: false,
    lastChecked: null,
    balance: null,
    error: null
  });

  const { hasCredentials } = useMspaceApi();
  const { executeWithRetry } = useMspaceReliability();

  const checkConnection = async () => {
    if (!hasCredentials) {
      setStatus(prev => ({ 
        ...prev, 
        isConnected: false, 
        error: 'No credentials configured',
        lastChecked: new Date()
      }));
      return;
    }

    setStatus(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      const result = await executeWithRetry(
        async () => {
          // Use a simple balance check to verify connection
          const response = await fetch(`https://api.mspace.co.ke/smsapi/v2/balance`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          return response.json();
        },
        'Connection check',
        { maxRetries: 2, baseDelay: 500 }
      );

      setStatus({
        isConnected: true,
        isChecking: false,
        lastChecked: new Date(),
        balance: result.balance || null,
        error: null
      });

    } catch (error: any) {
      setStatus({
        isConnected: false,
        isChecking: false,
        lastChecked: new Date(),
        balance: null,
        error: error.message || 'Connection failed'
      });
    }
  };

  // Auto-check connection when credentials are available
  useEffect(() => {
    if (hasCredentials) {
      checkConnection();
    }
  }, [hasCredentials]);

  // Periodic connection check (every 5 minutes)
  useEffect(() => {
    if (!hasCredentials) return;

    const interval = setInterval(() => {
      checkConnection();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [hasCredentials]);

  return {
    ...status,
    checkConnection,
    isHealthy: status.isConnected && !status.error
  };
};
