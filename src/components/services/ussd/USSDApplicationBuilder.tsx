
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Phone } from 'lucide-react';
import { USSDMenuBuilder } from './USSDMenuBuilder';
import { USSDApplicationCard } from './USSDApplicationCard';
import { USSDTestSimulator } from './USSDTestSimulator';
import { USSDSessionManager } from './USSDSessionManager';
import { MenuNode, USSDApplication } from './types';

const fetchUSSDApplications = async (): Promise<USSDApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('mspace_ussd_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching USSD applications:', error);
      return [];
    }
    
    return (data || []).map((item: any) => ({
      id: item.id,
      service_code: item.service_code,
      menu_structure: Array.isArray(item.menu_structure) ? item.menu_structure as MenuNode[] : [],
      callback_url: item.callback_url,
      status: item.status || 'pending'
    }));
  } catch (error) {
    console.error('Failed to fetch USSD applications:', error);
    return [];
  }
};

export function USSDApplicationBuilder() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingApp, setEditingApp] = useState<USSDApplication | null>(null);
  const [testingApp, setTestingApp] = useState<USSDApplication | null>(null);
  const [serviceCode, setServiceCode] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [menuStructure, setMenuStructure] = useState<MenuNode[]>([
    {
      id: 'root',
      text: 'Welcome to our service. Please select an option:',
      options: ['Option 1', 'Option 2'],
      isEndNode: false
    }
  ]);
  const [activeTab, setActiveTab] = useState<'applications' | 'sessions'>('applications');

  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['ussd-applications'],
    queryFn: fetchUSSDApplications
  });

  const createApplication = useMutation({
    mutationFn: async (appData: { service_code: string; menu_structure: MenuNode[]; callback_url: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Try to find an active subscription
      const { data: subscription } = await supabase
        .from('user_service_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!subscription) {
        // Create a basic subscription for testing
        const { data: newSubscription, error: subError } = await supabase
          .from('user_service_subscriptions')
          .insert({
            user_id: user.id,
            service_id: null, // Will be null for now
            status: 'active'
          })
          .select()
          .single();

        if (subError) throw subError;
        
        const { data, error } = await supabase
          .from('mspace_ussd_applications')
          .insert({
            subscription_id: newSubscription.id,
            service_code: appData.service_code,
            menu_structure: appData.menu_structure as any,
            callback_url: appData.callback_url,
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('mspace_ussd_applications')
          .insert({
            subscription_id: subscription.id,
            service_code: appData.service_code,
            menu_structure: appData.menu_structure as any,
            callback_url: appData.callback_url,
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ussd-applications'] });
      toast.success('USSD application created successfully');
      setIsCreating(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to create application: ${error.message}`);
    }
  });

  const updateApplication = useMutation({
    mutationFn: async (appData: { id: string; service_code: string; menu_structure: MenuNode[]; callback_url: string }) => {
      const { data, error } = await supabase
        .from('mspace_ussd_applications')
        .update({
          service_code: appData.service_code,
          menu_structure: appData.menu_structure as any,
          callback_url: appData.callback_url
        })
        .eq('id', appData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ussd-applications'] });
      toast.success('USSD application updated successfully');
      setEditingApp(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to update application: ${error.message}`);
    }
  });

  const resetForm = () => {
    setServiceCode('');
    setCallbackUrl('');
    setMenuStructure([{
      id: 'root',
      text: 'Welcome to our service. Please select an option:',
      options: ['Option 1', 'Option 2'],
      isEndNode: false
    }]);
  };

  const handleSubmit = () => {
    if (!serviceCode || !callbackUrl || menuStructure.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingApp) {
      updateApplication.mutate({
        id: editingApp.id,
        service_code: serviceCode,
        menu_structure: menuStructure,
        callback_url: callbackUrl
      });
    } else {
      createApplication.mutate({
        service_code: serviceCode,
        menu_structure: menuStructure,
        callback_url: callbackUrl
      });
    }
  };

  const handleMenuUpdate = (updatedMenu: MenuNode[]) => {
    setMenuStructure(updatedMenu);
  };

  const handleEdit = (app: USSDApplication) => {
    setEditingApp(app);
    setServiceCode(app.service_code);
    setCallbackUrl(app.callback_url);
    setMenuStructure(app.menu_structure);
    setIsCreating(true);
  };

  const handleTest = (app: USSDApplication) => {
    setTestingApp(app);
  };

  const handleCancelEdit = () => {
    setEditingApp(null);
    setIsCreating(false);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">USSD Services</h2>
          <p className="text-gray-600">
            Create and manage your USSD applications with visual menu builders.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'applications' ? 'default' : 'outline'}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </Button>
          <Button 
            variant={activeTab === 'sessions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sessions')}
          >
            Sessions
          </Button>
          {activeTab === 'applications' && (
            <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Application
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'sessions' ? (
        <USSDSessionManager />
      ) : (
        <>
          {isCreating && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  {editingApp ? 'Edit USSD Application' : 'Create USSD Application'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serviceCode">Service Code *</Label>
                    <Input
                      id="serviceCode"
                      placeholder="e.g., *123#"
                      value={serviceCode}
                      onChange={(e) => setServiceCode(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="callbackUrl">Callback URL *</Label>
                    <Input
                      id="callbackUrl"
                      placeholder="https://your-app.com/ussd/callback"
                      value={callbackUrl}
                      onChange={(e) => setCallbackUrl(e.target.value)}
                    />
                  </div>
                </div>

                <USSDMenuBuilder 
                  menuStructure={menuStructure} 
                  onUpdateMenu={handleMenuUpdate}
                />

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={createApplication.isPending || updateApplication.isPending}
                  >
                    {createApplication.isPending || updateApplication.isPending 
                      ? (editingApp ? 'Updating...' : 'Creating...') 
                      : (editingApp ? 'Update Application' : 'Create Application')
                    }
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {testingApp && (
            <USSDTestSimulator 
              application={testingApp}
              onClose={() => setTestingApp(null)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <USSDApplicationCard 
                key={app.id} 
                application={app}
                onEdit={handleEdit}
                onTest={handleTest}
              />
            ))}
          </div>

          {applications.length === 0 && !isCreating && (
            <Card>
              <CardContent className="text-center py-8">
                <Phone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No USSD Applications</h3>
                <p className="text-gray-600 mb-4">
                  Create your first USSD application to start building interactive menus.
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Application
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
