
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCampaigns } from '@/hooks/useCampaigns';
import { X, Plus } from 'lucide-react';

interface CampaignFormProps {
  onClose: () => void;
}

export function CampaignForm({ onClose }: CampaignFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'sms',
    content: '',
    recipients: [] as string[]
  });
  const [recipientInput, setRecipientInput] = useState('');
  const { createCampaign } = useCampaigns();

  const addRecipient = () => {
    if (recipientInput.trim() && !formData.recipients.includes(recipientInput.trim())) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, recipientInput.trim()]
      }));
      setRecipientInput('');
    }
  };

  const removeRecipient = (recipient: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== recipient)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.content && formData.recipients.length > 0) {
      createCampaign.mutate({
        name: formData.name,
        type: formData.type,
        content: formData.content,
        message: formData.content, // Required by database schema
        recipient_count: formData.recipients.length,
        status: 'draft'
      }, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  const bulkAddRecipients = (text: string) => {
    const recipients = text
      .split(/[,\n]/)
      .map(r => r.trim())
      .filter(r => r && !formData.recipients.includes(r));
    
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, ...recipients]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">Campaign Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter campaign name"
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Campaign Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="content">Message Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Enter your message content"
            rows={4}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Character count: {formData.content.length}
          </p>
        </div>

        <div>
          <Label>Recipients</Label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder={formData.type === 'sms' ? 'Enter phone number' : 'Enter email address'}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
              />
              <Button type="button" onClick={addRecipient}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div>
              <Label htmlFor="bulk">Bulk Add (comma or line separated)</Label>
              <Textarea
                id="bulk"
                placeholder="recipient1@example.com, recipient2@example.com"
                onChange={(e) => bulkAddRecipients(e.target.value)}
                rows={3}
              />
            </div>

            {formData.recipients.length > 0 && (
              <div className="max-h-32 overflow-y-auto border rounded p-2">
                <p className="text-sm font-medium mb-2">
                  Recipients ({formData.recipients.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {formData.recipients.map((recipient, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {recipient}
                      <button
                        type="button"
                        onClick={() => removeRecipient(recipient)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!formData.name || !formData.content || formData.recipients.length === 0 || createCampaign.isPending}
        >
          {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
        </Button>
      </div>
    </form>
  );
}
