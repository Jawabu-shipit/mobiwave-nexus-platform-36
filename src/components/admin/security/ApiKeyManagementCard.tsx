
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import EnvironmentManager from '@/lib/environment-config';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { toast } from 'sonner';

interface ApiKeyConfig {
  name: string;
  label: string;
  description: string;
}

const apiKeyConfigs: ApiKeyConfig[] = [
  { name: 'twilio_api_key', label: 'Twilio API Key', description: 'For SMS services' },
  { name: 'sendgrid_api_key', label: 'SendGrid API Key', description: 'For email services' },
  { name: 'stripe_api_key', label: 'Stripe API Key', description: 'For payment processing' },
  { name: 'aws_access_key', label: 'AWS Access Key', description: 'For cloud services' }
];

const ApiKeyManagementCard: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const environmentManager = EnvironmentManager.getInstance();
  const { logSecurityEvent } = useAuditLogger();

  const handleApiKeyUpdate = (keyName: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [keyName]: value
    }));
  };

  const saveApiKey = async (keyName: string) => {
    const key = apiKeys[keyName];
    if (!key) {
      toast.error('API key cannot be empty');
      return;
    }

    try {
      environmentManager.setSecureApiKey(keyName, key);
      await logSecurityEvent('api_key_updated', 'medium', { 
        metadata: { keyName }
      });
      toast.success(`${keyName} API key saved securely`);
      
      // Clear the input after saving
      setApiKeys(prev => ({
        ...prev,
        [keyName]: ''
      }));
    } catch (error) {
      toast.error('Failed to save API key');
      console.error('Error saving API key:', error);
    }
  };

  const toggleKeyVisibility = (keyName: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Management
        </CardTitle>
        <CardDescription>
          Securely store and manage API keys with encryption at rest
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {apiKeyConfigs.map((config) => (
          <div key={config.name} className="space-y-2">
            <Label htmlFor={config.name}>{config.label}</Label>
            <p className="text-sm text-gray-600 mb-2">{config.description}</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id={config.name}
                  type={showKeys[config.name] ? "text" : "password"}
                  value={apiKeys[config.name] || ''}
                  onChange={(e) => handleApiKeyUpdate(config.name, e.target.value)}
                  placeholder="Enter API key..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleKeyVisibility(config.name)}
                >
                  {showKeys[config.name] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                onClick={() => saveApiKey(config.name)}
                disabled={!apiKeys[config.name]}
              >
                Save
              </Button>
            </div>
          </div>
        ))}
        
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            API keys are encrypted at rest using AES encryption. Never share these keys or commit them to version control.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyManagementCard;
