
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useUnifiedSMSService } from '@/hooks/useUnifiedSMSService';
import { useUserCredits } from '@/hooks/useUserCredits';
import { QuickSMSForm } from './sms/QuickSMSForm';
import { QuickSMSSummary } from './sms/QuickSMSSummary';
import { QuickSMSActions } from './sms/QuickSMSActions';
import { AdvancedSchedulingForm, ScheduleConfig } from './sms/AdvancedSchedulingForm';
import { AutomationWorkflows } from './sms/AutomationWorkflows';
import { ScheduledCampaignsManager } from './sms/ScheduledCampaignsManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { validateAndFormatPhoneNumber, getValidPhoneNumbers } from '@/utils/phoneValidation';

export function QuickSMS() {
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState('');
  const [scheduledFor, setScheduledFor] = useState<string>('');
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({ type: 'immediate' });
  const [isLoading, setIsLoading] = useState(false);

  const { sendUnifiedSMS } = useUnifiedSMSService();
  const { data: credits } = useUserCredits();

  const smsCount = Math.ceil(message.length / 160);
  const estimatedCost = recipients.length * smsCount * 0.05;

  const addRecipient = () => {
    if (newRecipient.trim()) {
      const validation = validateAndFormatPhoneNumber(newRecipient.trim());
      
      if (validation.isValid && validation.formattedNumber) {
        if (!recipients.includes(validation.formattedNumber)) {
          setRecipients([...recipients, validation.formattedNumber]);
          setNewRecipient('');
          toast.success('Recipient added successfully');
        } else {
          toast.error('Recipient already added');
        }
      } else {
        toast.error(validation.errorMessage || 'Invalid phone number format');
      }
    }
  };

  const removeRecipient = (phone: string) => {
    setRecipients(recipients.filter(r => r !== phone));
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    // Validate all phone numbers before sending
    const validPhoneNumbers = getValidPhoneNumbers(recipients);
    const invalidCount = recipients.length - validPhoneNumbers.length;
    
    if (invalidCount > 0) {
      toast.error(`${invalidCount} invalid phone number(s) found. Please check and correct them.`);
      return;
    }

    if (validPhoneNumbers.length === 0) {
      toast.error('No valid phone numbers found');
      return;
    }

    if (credits && credits.credits_remaining < estimatedCost) {
      toast.error(`Insufficient credits. You need $${estimatedCost.toFixed(2)} but have $${credits.credits_remaining.toFixed(2)}`);
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendUnifiedSMS({
        recipients: validPhoneNumbers, // Use validated phone numbers
        message,
        senderId: 'MOBIWAVE',
        campaignName: `Quick SMS ${new Date().toLocaleString()}`,
        scheduleConfig,
        metadata: {
          flow: 'quick_sms',
          estimatedCost,
          smsCount,
          validatedRecipients: validPhoneNumbers.length,
          originalRecipients: recipients.length
        }
      });

      if (result.scheduled) {
        toast.success('SMS campaign scheduled successfully!');
      } else if (result.automated) {
        toast.success('Automated SMS workflow created successfully!');
      } else {
        toast.success(`SMS sent successfully! ${result.delivered || 0} delivered, ${result.failed || 0} failed`);
      }
      
      // Reset form
      setMessage('');
      setRecipients([]);
      setScheduledFor('');
      setScheduleConfig({ type: 'immediate' });
    } catch (error: any) {
      toast.error(`Failed to send SMS: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (scheduleConfig.type === 'scheduled' && !scheduleConfig.datetime) {
      toast.error('Please select a date and time');
      return;
    }

    await handleSend();
  };

  const canSend = message.trim() && recipients.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Quick SMS & Automation
        </h1>
        <p className="text-gray-600 mt-2">
          Send instant SMS messages or set up automated campaigns
        </p>
      </div>

      <Tabs defaultValue="quick-sms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick-sms">Quick SMS</TabsTrigger>
          <TabsTrigger value="advanced-schedule">Advanced Schedule</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-sms" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
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
            </div>

            <div className="space-y-6">
              <QuickSMSSummary
                recipients={recipients}
                message={message}
                estimatedCost={estimatedCost}
              />
              
              <QuickSMSActions
                scheduledFor={scheduledFor}
                isLoading={isLoading}
                canSend={canSend}
                onSend={handleSend}
                onSchedule={handleSchedule}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced-schedule" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
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
              
              <AdvancedSchedulingForm
                onScheduleChange={setScheduleConfig}
                initialConfig={scheduleConfig}
              />
            </div>

            <div className="space-y-6">
              <QuickSMSSummary
                recipients={recipients}
                message={message}
                estimatedCost={estimatedCost}
              />
              
              <QuickSMSActions
                scheduledFor={scheduleConfig.type === 'scheduled' ? scheduleConfig.datetime || '' : ''}
                isLoading={isLoading}
                canSend={canSend}
                onSend={handleSend}
                onSchedule={handleSchedule}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="automation">
          <AutomationWorkflows />
        </TabsContent>

        <TabsContent value="scheduled">
          <ScheduledCampaignsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
