
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

import { Key, Shield, CheckCircle, AlertCircle, Bug } from 'lucide-react';
import { checkAndFixApiCredentialsTable, testApiCredentialsSave } from '@/utils/database-check';


interface ApiCredentialsData {
  api_key: string;
  username: string;
  sender_id: string;
  is_active: boolean;
}

export function ApiCredentials() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<ApiCredentialsData>({
    api_key: '',
    username: '',
    sender_id: '',
    is_active: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const [isDebugging, setIsDebugging] = useState(false);

  useEffect(() => {
    if (user) {
      loadCredentials();
    }
  }, [user]);

  const loadCredentials = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_credentials')
        .select('*')
        .eq('user_id', user.id)
        .eq('service_name', 'mspace')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading credentials:', error);
        // Don't show error toast for loading - it's not critical
        return;
      }

      if (data) {
        // Extract from additional_config since the table uses encrypted fields
        const config = data.additional_config as any || {};
        
        // Try to decrypt api_key_encrypted if available, otherwise use from config
        let apiKey = config.api_key || '';
        if (!apiKey && data.api_key_encrypted) {
          try {
            apiKey = atob(data.api_key_encrypted);
          } catch (e) {
            console.warn('Failed to decode encrypted API key');
            apiKey = data.api_key_encrypted; // Use as-is if decoding fails
          }
        }
        
        setCredentials({
          api_key: apiKey,
          username: config.username || '',
          sender_id: config.sender_id || '',
          is_active: data.is_active || false
        });
      }
    } catch (error) {
      console.error('Credentials load failed:', error);
      // Don't show error toast for loading - it's not critical
    } finally {
      setIsLoading(false);
    }
  };

  const saveCredentials = async () => {
    if (!user) {
      toast.error('User not authenticated. Please log in again.');
      return;
    }

    if (!credentials.api_key.trim()) {
      toast.error('API key is required');
      return;
    }

    if (!credentials.username.trim()) {
      toast.error('Username is required');
      return;
    }

    setIsSaving(true);
    try {
      // First, check if user is properly authenticated
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser) {
        console.error('Authentication error:', authError);
        toast.error('Authentication failed. Please log in again.');
        return;
      }

      const credentialsData: any = {
        user_id: currentUser.id,
        service_name: 'mspace',
        additional_config: {
          api_key: credentials.api_key,
          username: credentials.username,
          sender_id: credentials.sender_id
        },
        is_active: true
      };

      // Only add api_key_encrypted if the column exists (for backward compatibility)
      try {
        credentialsData.api_key_encrypted = btoa(credentials.api_key);
      } catch (e) {
        console.warn('Could not encode API key, storing in additional_config only');
      }

      console.log('Attempting to save credentials for user:', currentUser.id);

      // Try to update first, then insert if not exists
      const { data: existingData, error: selectError } = await supabase
        .from('api_credentials')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('service_name', 'mspace')
        .single();

      let data, error;
      
      if (existingData) {
        // Update existing record
        const updateResult = await supabase
          .from('api_credentials')
          .update(credentialsData)
          .eq('user_id', currentUser.id)
          .eq('service_name', 'mspace')
          .select();
        data = updateResult.data;
        error = updateResult.error;
      } else {
        // Insert new record
        const insertResult = await supabase
          .from('api_credentials')
          .insert(credentialsData)
          .select();
        data = insertResult.data;
        error = insertResult.error;
      }

      if (error) {
        console.error('Database error saving credentials:', error);
        
        // Provide more specific error messages
        if (error.code === '23505') {
          toast.error('Credentials already exist. Please try updating instead.');
        } else if (error.code === '42501') {
          toast.error('Permission denied. Please check your account permissions.');
        } else if (error.message.includes('RLS')) {
          toast.error('Security policy violation. Please contact support.');
        } else {
          toast.error(`Failed to save API credentials: ${error.message}`);
        }
        return;
      }

      console.log('Credentials saved successfully:', data);
      setCredentials(prev => ({ ...prev, is_active: true }));
      toast.success('API credentials saved successfully');
      
      // Reload credentials to ensure UI is in sync
      await loadCredentials();
      
    } catch (error: any) {
      console.error('Unexpected error saving credentials:', error);
      toast.error(`Unexpected error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    if (!credentials.api_key || !credentials.username) {
      toast.error('Please provide API key and username');
      return;
    }

    setIsTestingConnection(true);
    try {
      const response = await fetch(`https://api.mspace.co.ke/smsapi/v2/balance/apikey=${credentials.api_key}/username=${credentials.username}`);
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Connection successful! Balance: ${data.balance || 'N/A'}`);
      } else {
        toast.error('Connection failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('Connection test failed. Please check your credentials.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const runDiagnostics = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsDebugging(true);
    try {
      toast.info('Running diagnostics...');
      
      // Check table accessibility
      const tableCheck = await checkAndFixApiCredentialsTable();
      console.log('Table check result:', tableCheck);
      
      // Test user authentication
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      console.log('Auth check:', { user: currentUser?.id, error: authError });
      
      if (currentUser) {
        // Test insert capability
        const insertTest = await testApiCredentialsSave(currentUser.id);
        console.log('Insert test result:', insertTest);
        
        if (insertTest.success) {
          toast.success('Diagnostics passed! Database is working correctly.');
        } else {
          toast.error(`Database test failed: ${insertTest.error?.message || 'Unknown error'}`);
        }
      } else {
        toast.error('Authentication test failed');
      }
      
    } catch (error: any) {
      console.error('Diagnostics failed:', error);
      toast.error(`Diagnostics failed: ${error.message}`);
    } finally {
      setIsDebugging(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Mspace API Configuration
          </CardTitle>
          <Badge variant={credentials.is_active ? "default" : "secondary"}>
            {credentials.is_active ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Active
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 mr-1" />
                Inactive
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="apiKey"
                type="password"
                value={credentials.api_key}
                onChange={(e) => setCredentials(prev => ({ ...prev, api_key: e.target.value }))}
                className="pl-10"
                placeholder="Enter your Mspace API key"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter your Mspace username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderId">Sender ID</Label>
            <Input
              id="senderId"
              value={credentials.sender_id}
              onChange={(e) => setCredentials(prev => ({ ...prev, sender_id: e.target.value }))}
              placeholder="Enter your sender ID (e.g., COMPANY)"
              maxLength={11}
            />
            <p className="text-sm text-gray-500">
              Sender ID should be 3-11 characters. Use your company name or brand.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={saveCredentials} 
            disabled={isSaving || !credentials.api_key || !credentials.username}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : 'Save Credentials'}
          </Button>
          <Button 
            variant="outline" 
            onClick={testConnection}
            disabled={isTestingConnection || !credentials.api_key || !credentials.username}
          >
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={runDiagnostics}
            disabled={isDebugging}
          >
            <Bug className="w-4 h-4 mr-1" />
            {isDebugging ? 'Running...' : 'Debug'}
          </Button>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How to get your Mspace credentials:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Visit <a href="https://mspace.co.ke" target="_blank" rel="noopener noreferrer" className="underline">mspace.co.ke</a></li>
            <li>Sign up for an account or log in</li>
            <li>Navigate to API settings in your dashboard</li>
            <li>Copy your API key and username</li>
            <li>Set up your preferred sender ID</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
