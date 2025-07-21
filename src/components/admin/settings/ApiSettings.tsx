
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { Shield, CheckCircle, AlertTriangle, Key, Bug } from 'lucide-react';
import { checkAndFixApiCredentialsTable, testApiCredentialsSave } from '@/utils/database-check';

interface ApiCredentialsData {
  api_key: string;
  username: string;
  sender_id: string;
  is_active: boolean;
}

export function ApiSettings() {
  const { user } = useAuth();
  const [mspaceCredentials, setMspaceCredentials] = useState<ApiCredentialsData>({
    api_key: '',
    username: '',
    sender_id: '',
    is_active: false
  });
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);

  useEffect(() => {
    if (user) {
      loadMspaceCredentials();
    }
  }, [user]);

  const loadMspaceCredentials = async () => {
    if (!user) return;

    setIsLoadingCredentials(true);
    try {
      const { data, error } = await supabase
        .from('api_credentials')
        .select('*')
        .eq('service_name', 'mspace')
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading credentials:', error);
        toast.error('Failed to load API credentials');
        return;
      }

      if (data) {
        const config = data.additional_config as any || {};
        
        // Try to get API key from additional_config first, then from encrypted field
        let apiKey = config.api_key || '';
        if (!apiKey && data.api_key_encrypted) {
          try {
            apiKey = atob(data.api_key_encrypted);
          } catch (e) {
            console.warn('Failed to decode encrypted API key');
            apiKey = data.api_key_encrypted; // Use as-is if decoding fails
          }
        }
        
        setMspaceCredentials({
          api_key: apiKey,
          username: config.username || '',
          sender_id: config.sender_id || '',
          is_active: data.is_active || false
        });
      } else {
        setMspaceCredentials({
          api_key: '',
          username: '',
          sender_id: '',
          is_active: false
        });
      }
    } catch (error) {
      console.error('Credentials load failed:', error);
      toast.error('Failed to load API credentials');
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  const saveMspaceCredentials = async () => {
    if (!user) {
      toast.error('User not authenticated. Please log in again.');
      return;
    }

    if (!mspaceCredentials.api_key.trim()) {
      toast.error('API key is required');
      return;
    }

    if (!mspaceCredentials.username.trim()) {
      toast.error('Username is required');
      return;
    }

    setIsSavingCredentials(true);
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
          api_key: mspaceCredentials.api_key,
          username: mspaceCredentials.username,
          sender_id: mspaceCredentials.sender_id
        },
        is_active: true
      };

      // Only add api_key_encrypted if the column exists (for backward compatibility)
      try {
        credentialsData.api_key_encrypted = btoa(mspaceCredentials.api_key);
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
        } else if (error.message.includes('column') && error.message.includes('does not exist')) {
          toast.error('Database schema issue. Please contact support to update the database.');
        } else {
          toast.error(`Failed to save API credentials: ${error.message}`);
        }
        return;
      }

      console.log('Credentials saved successfully:', data);
      setMspaceCredentials(prev => ({ ...prev, is_active: true }));
      toast.success('Mspace API credentials saved successfully');
      
      // Reload credentials to ensure UI is in sync
      await loadMspaceCredentials();
      
    } catch (error: any) {
      console.error('Unexpected error saving credentials:', error);
      toast.error(`Unexpected error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsSavingCredentials(false);
    }
  };

  const testMspaceConnection = async () => {
    if (!mspaceCredentials.api_key || !mspaceCredentials.username) {
      toast.error('Please provide API key and username before testing');
      return;
    }

    setIsTestingConnection(true);
    try {
      const response = await fetch(
        `https://api.mspace.co.ke/smsapi/v2/balance/apikey=${mspaceCredentials.api_key}/username=${mspaceCredentials.username}`
      );
      
      if (response.ok) {
        const data = await response.text();
        const balance = parseInt(data.trim());
        
        if (!isNaN(balance)) {
          toast.success(`Connection successful! SMS Balance: ${balance} credits`);
        } else {
          toast.success('Connection successful! API credentials are valid.');
        }
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        toast.error(`Connection failed: Invalid credentials or API error (${response.status})`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('Connection test failed. Please check your credentials and internet connection.');
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

  if (isLoadingCredentials) {
    return (
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
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
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Mspace API Configuration
          </CardTitle>
          <Badge variant={mspaceCredentials.is_active ? "default" : "secondary"}>
            {mspaceCredentials.is_active ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Active
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-1" />
                Inactive
              </>
            )}
          </Badge>
        </div>
        <CardDescription>
          Configure system-wide Mspace API credentials for SMS functionality. These credentials will be used by all users for SMS services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">
              Mspace API Key <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="apiKey"
                type="password"
                value={mspaceCredentials.api_key}
                onChange={(e) => setMspaceCredentials(prev => ({ ...prev, api_key: e.target.value }))}
                className="pl-10"
                placeholder="Enter your Mspace API key"
              />
            </div>
            <p className="text-sm text-gray-500">
              Your Mspace API key for SMS services. Keep this secure.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              value={mspaceCredentials.username}
              onChange={(e) => setMspaceCredentials(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter your Mspace username"
            />
            <p className="text-sm text-gray-500">
              Your Mspace account username.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderId">Sender ID (Optional)</Label>
            <Input
              id="senderId"
              value={mspaceCredentials.sender_id}
              onChange={(e) => setMspaceCredentials(prev => ({ ...prev, sender_id: e.target.value }))}
              placeholder="Enter your sender ID (e.g., COMPANY)"
              maxLength={11}
            />
            <p className="text-sm text-gray-500">
              Sender ID should be 3-11 characters. Use your company name or brand. If left empty, a default will be used.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={saveMspaceCredentials} 
            disabled={isSavingCredentials || !mspaceCredentials.api_key.trim() || !mspaceCredentials.username.trim()}
            className="flex-1"
          >
            {isSavingCredentials ? 'Saving...' : 'Save Credentials'}
          </Button>
          <Button 
            variant="outline" 
            onClick={testMspaceConnection}
            disabled={isTestingConnection || !mspaceCredentials.api_key.trim() || !mspaceCredentials.username.trim()}
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
            <li>Visit <a href="https://mspace.co.ke" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">mspace.co.ke</a></li>
            <li>Sign up for an account or log in to your existing account</li>
            <li>Navigate to API settings in your dashboard</li>
            <li>Copy your API key and username</li>
            <li>Set up your preferred sender ID (optional)</li>
          </ol>
        </div>

        {mspaceCredentials.is_active && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-900">API Configuration Active</h4>
            </div>
            <p className="text-sm text-green-800 mt-1">
              Mspace API credentials are configured and active. SMS services are available system-wide.
            </p>
          </div>
        )}

        {!mspaceCredentials.is_active && mspaceCredentials.api_key && mspaceCredentials.username && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-900">Configuration Pending</h4>
            </div>
            <p className="text-sm text-yellow-800 mt-1">
              Please save and test your credentials to activate SMS services.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
