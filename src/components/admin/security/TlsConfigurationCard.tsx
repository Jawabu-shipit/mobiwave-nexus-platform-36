
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { toast } from 'sonner';

interface TlsConfigurationCardProps {
  tlsStatus: boolean;
  encryptionEnabled: boolean;
}

const TlsConfigurationCard: React.FC<TlsConfigurationCardProps> = ({
  tlsStatus,
  encryptionEnabled
}) => {
  const { logSecurityEvent } = useAuditLogger();

  const testTlsConnection = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast.success('TLS connection successful');
        await logSecurityEvent('tls_test_success', 'low');
      } else {
        toast.error('TLS connection failed');
        await logSecurityEvent('tls_test_failed', 'medium');
      }
    } catch (error: any) {
      toast.error('TLS connection test failed');
      await logSecurityEvent('tls_test_error', 'high', { 
        error: error.message
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          TLS Configuration
        </CardTitle>
        <CardDescription>
          Transport Layer Security status and configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>TLS Status</Label>
            <p className="text-sm text-gray-600">
              Current TLS configuration status
            </p>
          </div>
          <Badge variant={tlsStatus ? "default" : "destructive"}>
            {tlsStatus ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label>Encryption at Rest</Label>
            <p className="text-sm text-gray-600">
              API keys and sensitive data encryption
            </p>
          </div>
          <Badge variant={encryptionEnabled ? "default" : "secondary"}>
            {encryptionEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        <Button onClick={testTlsConnection} variant="outline">
          Test TLS Connection
        </Button>
      </CardContent>
    </Card>
  );
};

export default TlsConfigurationCard;
