
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useUnifiedSMSService } from '@/hooks/useUnifiedSMSService';
import { useUserCredits } from '@/hooks/useUserCredits';
import { CampaignSteps } from './CampaignSteps';
import { CampaignNavigation } from './CampaignNavigation';
import { CampaignReview } from './CampaignReview';
import { AdvancedSchedulingForm } from './AdvancedSchedulingForm';
import { EnhancedRecipientManager } from './EnhancedRecipientManager';
import { MessageComposer } from './MessageComposer';
import { CampaignData } from './campaign/CampaignData';
import { CampaignStepValidator } from './campaign/CampaignStepValidator';
import { CampaignLauncher } from './campaign/CampaignLauncher';
import { ContactGroupSelector } from './ContactGroupSelector';

const steps = [
  { id: 1, title: 'Campaign', description: 'Basic info' },
  { id: 2, title: 'Recipients', description: 'Add contacts' },
  { id: 3, title: 'Message', description: 'Compose SMS' },
  { id: 4, title: 'Schedule', description: 'When to send' },
  { id: 5, title: 'Review', description: 'Final check' }
];

export function GuidedBulkSMSFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLaunching, setIsLaunching] = useState(false);
  const { sendUnifiedSMS } = useUnifiedSMSService();
  const { data: credits } = useUserCredits();

  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    recipients: [],
    message: '',
    senderId: 'MOBIWAVE',
    scheduleConfig: { type: 'immediate' }
  });

  const smsCount = Math.ceil(campaignData.message.length / 160);
  const estimatedCost = campaignData.recipients.length * smsCount * 0.05;

  const isStepValid = () => CampaignStepValidator.isStepValid(currentStep, campaignData);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLaunch = async () => {
    if (!isStepValid()) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsLaunching(true);
    try {
      const result = await CampaignLauncher.launch(
        campaignData,
        estimatedCost,
        credits,
        sendUnifiedSMS
      );

      CampaignLauncher.handleResult(result);

      // Reset form
      setCampaignData({
        name: '',
        recipients: [],
        message: '',
        senderId: 'MOBIWAVE',
        scheduleConfig: { type: 'immediate' }
      });
      setCurrentStep(1);
    } catch (error: any) {
      toast.error(`Failed to launch campaign: ${error.message}`);
    } finally {
      setIsLaunching(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="campaignName">Campaign Name *</Label>
                <Input
                  id="campaignName"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                  placeholder="Enter campaign name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="senderId">Sender ID</Label>
                <Input
                  id="senderId"
                  value={campaignData.senderId}
                  onChange={(e) => setCampaignData({ ...campaignData, senderId: e.target.value })}
                  placeholder="MOBIWAVE"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedRecipientManager
              recipients={campaignData.recipients}
              onRecipientsUpdate={(recipients) => setCampaignData({ ...campaignData, recipients })}
              showImportOptions={true}
              showGroupManagement={true}
            />
            <ContactGroupSelector
              selectedContacts={campaignData.recipients}
              onContactsChange={(contacts) => setCampaignData({ ...campaignData, recipients: contacts })}
              onAddManualRecipient={(phone) => setCampaignData({ ...campaignData, recipients: [...campaignData.recipients, phone] })}
            />
          </div>
        );

      case 3:
        return (
          <MessageComposer
            message={campaignData.message}
            onMessageChange={(message) => setCampaignData({ ...campaignData, message })}
            showPersonalization={true}
            showTemplates={true}
          />
        );

      case 4:
        return (
          <AdvancedSchedulingForm
            onScheduleChange={(scheduleConfig) => setCampaignData({ ...campaignData, scheduleConfig })}
            initialConfig={campaignData.scheduleConfig}
          />
        );

      case 5:
        return (
          <CampaignReview
            campaignData={{
              ...campaignData,
              scheduledFor: campaignData.scheduleConfig.datetime ? new Date(campaignData.scheduleConfig.datetime) : undefined
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CampaignSteps currentStep={currentStep} steps={steps} />

     

      <div className="min-h-[400px]">
        {renderStepContent()}
         {/* Message Preview for Guided Bulk SMS */}
      {campaignData.message && campaignData.recipients.length > 0 && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-4">
            <div className="mb-2">
              <span className="block text-xs text-gray-600 mb-1">Message Preview:</span>
              <span className="block text-sm bg-white border rounded px-2 py-1">{campaignData.message}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-600 mb-1">First 5 Recipients:</span>
              <ul className="list-disc list-inside text-xs text-gray-700">
                {campaignData.recipients.slice(0, 5).map((recipient, idx) => (
                  <li key={recipient + idx}>{recipient}</li>
                ))}
                {campaignData.recipients.length > 5 && (
                  <li className="italic text-gray-400">...and {campaignData.recipients.length - 5} more</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
      </div>

      <CampaignNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        isStepValid={isStepValid()}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onLaunch={handleLaunch}
        isLaunching={isLaunching}
      />

      {/* Cost Summary */}
      {campaignData.recipients.length > 0 && campaignData.message && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center text-sm">
              <span>Recipients: {campaignData.recipients.length}</span>
              <span>SMS Count: {smsCount} per recipient</span>
              <span className="font-medium">Estimated Cost: ${estimatedCost.toFixed(2)}</span>
            </div>
            {credits && (
              <div className="mt-2 text-sm">
                <span className={`font-medium ${credits.credits_remaining >= estimatedCost ? 'text-green-600' : 'text-red-600'}`}>
                  Available Credits: ${credits.credits_remaining.toFixed(2)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
