
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWhatsAppSubscriptions } from '@/hooks/useWhatsAppSubscriptions';
import { MessageSquare, Globe, Key, Phone } from 'lucide-react';

interface WhatsAppSubscriptionFormProps {
  onSuccess?: () => void;
}

export function WhatsAppSubscriptionForm({ onSuccess }: WhatsAppSubscriptionFormProps) {
  const [formData, setFormData] = useState({
    phone_number_id: '',
    business_account_id: '',
    webhook_url: '',
    verify_token: '',
    access_token: ''
  });

  const { createSubscription, isCreating } = useWhatsAppSubscriptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createSubscription(formData);
      setFormData({
        phone_number_id: '',
        business_account_id: '',
        webhook_url: '',
        verify_token: '',
        access_token: ''
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create WhatsApp integration:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-600" />
          Create WhatsApp Integration
        </CardTitle>
        <CardDescription>
          Configure your WhatsApp Business API integration to start sending messages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number_id" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number ID
              </Label>
              <Input
                id="phone_number_id"
                value={formData.phone_number_id}
                onChange={(e) => handleInputChange('phone_number_id', e.target.value)}
                placeholder="Enter WhatsApp Phone Number ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_account_id">Business Account ID</Label>
              <Input
                id="business_account_id"
                value={formData.business_account_id}
                onChange={(e) => handleInputChange('business_account_id', e.target.value)}
                placeholder="Enter Business Account ID"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_url" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Webhook URL
            </Label>
            <Input
              id="webhook_url"
              type="url"
              value={formData.webhook_url}
              onChange={(e) => handleInputChange('webhook_url', e.target.value)}
              placeholder="https://your-domain.com/webhook"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="verify_token" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Verify Token
            </Label>
            <Input
              id="verify_token"
              value={formData.verify_token}
              onChange={(e) => handleInputChange('verify_token', e.target.value)}
              placeholder="Enter webhook verify token"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token</Label>
            <Textarea
              id="access_token"
              value={formData.access_token}
              onChange={(e) => handleInputChange('access_token', e.target.value)}
              placeholder="Enter WhatsApp Cloud API access token"
              className="min-h-[100px]"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isCreating}
          >
            {isCreating ? 'Creating Integration...' : 'Create WhatsApp Integration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
