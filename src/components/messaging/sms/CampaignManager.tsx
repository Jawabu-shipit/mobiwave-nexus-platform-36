
import React, { useState } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useMspaceService } from '@/hooks/useMspaceService';
import { toast } from 'sonner';
import { QuickSMSForm } from './QuickSMSForm';
import { CampaignStatus } from './CampaignStatus';

interface CampaignManagerProps {
  onSuccess?: () => void;
}

export function CampaignManager({ onSuccess }: CampaignManagerProps) {
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState('');
  const [scheduledFor, setScheduledFor] = useState<string>('');
  const [campaignName, setCampaignName] = useState('');

  const { createCampaign } = useCampaigns();
  const { data: credits } = useUserCredits();
  const { sendSMS, checkBalance } = useMspaceService();

  const smsCount = Math.ceil(message.length / 160);
  const estimatedCost = recipients.length * smsCount * 0.05;

  const addRecipient = () => {
    if (newRecipient.trim()) {
      const phone = newRecipient.trim();
      if (!recipients.includes(phone)) {
        setRecipients([...recipients, phone]);
        setNewRecipient('');
        toast.success('Recipient added');
      } else {
        toast.error('Recipient already added');
      }
    }
  };

  const removeRecipient = (phone: string) => {
    setRecipients(recipients.filter(r => r !== phone));
  };

  const handleSubmit = async (status: 'draft' | 'active') => {
    if (!campaignName || !message) {
      toast.error('Please fill in campaign name and message content');
      return;
    }

    if (status === 'active' && recipients.length === 0) {
      toast.error('Please add recipients to send the campaign');
      return;
    }

    if (status === 'active' && credits && credits.credits_remaining < estimatedCost) {
      toast.error(`Insufficient credits. You need $${estimatedCost.toFixed(2)} but have $${credits.credits_remaining.toFixed(2)}`);
      return;
    }

    try {
      const campaign = await createCampaign.mutateAsync({
        name: campaignName,
        type: 'sms' as const,
        content: message,
        message: message,
        status,
        recipient_count: recipients.length
      });

      if (status === 'active' && recipients.length > 0) {
        await sendSMS({
          recipients: recipients,
          message: message,
          senderId: 'MOBIWAVE',
          campaignId: campaign.id
        });
        
        toast.success('SMS campaign sent successfully! Check the Live Tracking tab for real-time updates.');
      } else {
        toast.success(`Campaign ${status === 'draft' ? 'saved as draft' : 'created'} successfully`);
      }
      
      setMessage('');
      setRecipients([]);
      setScheduledFor('');
      setCampaignName('');
      setNewRecipient('');

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create campaign');
      console.error('Campaign creation error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <QuickSMSForm
        message={message}
        recipients={recipients}
        newRecipient={newRecipient}
        scheduledFor={scheduledFor}
        onMessageChange={setMessage}
        onRecipientsChange={setRecipients}
        onNewRecipientChange={setNewRecipient}
        onScheduledForChange={setScheduledFor}
        onAddRecipient={addRecipient}
        onRemoveRecipient={removeRecipient}
      />
      <CampaignStatus checkBalance={checkBalance} />
    </div>
  );
}
