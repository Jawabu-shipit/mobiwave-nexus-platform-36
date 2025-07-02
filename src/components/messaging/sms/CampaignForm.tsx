
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Save } from 'lucide-react';

interface CampaignData {
  name: string;
  type: 'sms' | 'email' | 'whatsapp';
  content: string;
  subject: string;
  recipients: string[];
}

interface CampaignFormProps {
  campaignData: CampaignData;
  setCampaignData: (data: CampaignData) => void;
  onSubmit: (status: 'draft' | 'active') => void;
  isLoading: boolean;
  estimatedCost: number;
  characterCount: number;
  smsCount: number;
}

export function CampaignForm({
  campaignData,
  setCampaignData,
  onSubmit,
  isLoading,
  estimatedCost,
  characterCount,
  smsCount
}: CampaignFormProps) {
  const handleRecipientsChange = (value: string) => {
    const recipients = value.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.includes('+'));
    
    setCampaignData({ ...campaignData, recipients });
  };

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-600" />
          Create New SMS Campaign
        </CardTitle>
        <CardDescription>
          Design and launch your SMS campaign with real-time tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              placeholder="Enter campaign name..."
              value={campaignData.name}
              onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Campaign Type</Label>
            <Select 
              value={campaignData.type} 
              onValueChange={(value: 'sms' | 'email' | 'whatsapp') => 
                setCampaignData({ ...campaignData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Message Content *</Label>
            <div className="text-sm text-gray-500">
              {characterCount}/160 ({smsCount} SMS{smsCount > 1 ? ' segments' : ''})
            </div>
          </div>
          <Textarea
            id="content"
            placeholder="Type your SMS message here..."
            value={campaignData.content}
            onChange={(e) => setCampaignData({ ...campaignData, content: e.target.value })}
            className="min-h-[120px]"
            maxLength={918}
          />
          {smsCount > 1 && (
            <div className="text-xs text-gray-500">
              Long messages will be split into {smsCount} segments
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipients">Recipients (one per line)</Label>
          <Textarea
            id="recipients"
            placeholder="Enter phone numbers with country code, one per line:&#10;+254712345678&#10;+254798765432"
            onChange={(e) => handleRecipientsChange(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="text-sm text-gray-500">
            Recipients: {campaignData.recipients.length} | Valid format: +254XXXXXXXXX
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Estimated Cost:</span>
            <span className="text-lg font-bold text-blue-600">
              ${estimatedCost.toFixed(2)}
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {campaignData.recipients.length} recipients × {smsCount} SMS × $0.05
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => onSubmit('draft')}
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button
            onClick={() => onSubmit('active')}
            disabled={isLoading || campaignData.recipients.length === 0 || !campaignData.name || !campaignData.content}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Sending...' : 'Send Campaign'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
