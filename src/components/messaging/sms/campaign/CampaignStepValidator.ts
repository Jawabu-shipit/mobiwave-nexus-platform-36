
import { CampaignData } from './CampaignData';

export class CampaignStepValidator {
  static isStepValid(currentStep: number, campaignData: CampaignData): boolean {
    switch (currentStep) {
      case 1:
        return campaignData.name.trim().length > 0;
      case 2:
        return campaignData.recipients.length > 0;
      case 3:
        return campaignData.message.trim().length > 0;
      case 4:
        return true; // Schedule is optional
      case 5:
        return !!(campaignData.name && campaignData.recipients.length > 0 && campaignData.message);
      default:
        return false;
    }
  }
}
