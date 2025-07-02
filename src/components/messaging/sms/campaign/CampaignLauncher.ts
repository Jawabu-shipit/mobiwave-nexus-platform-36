
import { CampaignData, SMSResult } from './CampaignData';
import { toast } from 'sonner';

export class CampaignLauncher {
  static async launch(
    campaignData: CampaignData,
    estimatedCost: number,
    credits: any,
    sendUnifiedSMS: any
  ): Promise<SMSResult> {
    if (credits && credits.credits_remaining < estimatedCost) {
      throw new Error(`Insufficient credits. You need $${estimatedCost.toFixed(2)} but have $${credits.credits_remaining.toFixed(2)}`);
    }

    const recipientNumbers = campaignData.recipients.map(r => 
      typeof r === 'string' ? r : r.phone || r.number
    ).filter(Boolean);

    const smsCount = Math.ceil(campaignData.message.length / 160);

    const result = await sendUnifiedSMS({
      recipients: recipientNumbers,
      message: campaignData.message,
      senderId: campaignData.senderId,
      campaignName: campaignData.name,
      scheduleConfig: campaignData.scheduleConfig,
      metadata: {
        flow: 'guided_bulk_sms',
        estimatedCost,
        smsCount
      }
    }) as SMSResult;

    return result;
  }

  static handleResult(result: SMSResult): void {
    // Handle different result types based on schedule configuration
    const isScheduled = result?.scheduled === true;
    const isAutomated = result?.automated === true;

    if (isScheduled) {
      toast.success('SMS campaign scheduled successfully!');
    } else if (isAutomated) {
      toast.success('Automated SMS workflow created successfully!');
    } else {
      toast.success(`SMS campaign launched! ${result?.delivered || 0} delivered, ${result?.failed || 0} failed`);
    }
  }
}
