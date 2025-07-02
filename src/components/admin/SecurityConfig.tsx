
import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import EnvironmentManager from '@/lib/environment-config';
import SecurityManager from '@/lib/security';
import TlsConfigurationCard from './security/TlsConfigurationCard';
import ApiKeyManagementCard from './security/ApiKeyManagementCard';
import SecurityFeaturesCard from './security/SecurityFeaturesCard';

const SecurityConfig = () => {
  const [tlsStatus, setTlsStatus] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const environmentManager = EnvironmentManager.getInstance();
  const securityManager = SecurityManager.getInstance();

  useEffect(() => {
    const config = environmentManager.getConfig();
    setTlsStatus(securityManager.validateTLSConfig());
    setEncryptionEnabled(config.features.encryption);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Security Configuration</h2>
      </div>

      <TlsConfigurationCard 
        tlsStatus={tlsStatus} 
        encryptionEnabled={encryptionEnabled} 
      />

      <ApiKeyManagementCard />

      <SecurityFeaturesCard />
    </div>
  );
};

export default SecurityConfig;
