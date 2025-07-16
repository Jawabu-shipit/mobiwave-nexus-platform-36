
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MessageSquare, Send } from 'lucide-react';

interface CampaignReviewProps {
  campaignData: {
    name: string;
    recipients: any[];
    message: string;
    senderId: string;
    scheduleConfig: any;
    scheduledFor?: Date;
  };
}

export function CampaignReview({ campaignData }: CampaignReviewProps) {
  const smsCount = Math.ceil(campaignData.message.length / 160);
  const estimatedCost = campaignData.recipients.length * smsCount * 0.05;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Campaign Review
        </CardTitle>
        <CardDescription>
          Review your campaign details before launching
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Campaign Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium">{campaignData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sender ID:</span>
                  <span className="text-sm font-medium">{campaignData.senderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Schedule Type:</span>
                  <Badge variant="outline">{campaignData.scheduleConfig.type}</Badge>
                </div>
                {campaignData.scheduledFor && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Scheduled For:</span>
                    <span className="text-sm font-medium">
                      {campaignData.scheduledFor.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Recipients</h4>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{campaignData.recipients.length} recipients</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Message Preview</h4>
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-sm">{campaignData.message}</p>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{campaignData.message.length} characters</span>
                <span>{smsCount} SMS</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Cost Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Recipients:</span>
                  <span>{campaignData.recipients.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>SMS per recipient:</span>
                  <span>{smsCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total SMS:</span>
                  <span>{campaignData.recipients.length * smsCount}</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-2">
                  <span>Estimated Cost:</span>
                  <span>${estimatedCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
