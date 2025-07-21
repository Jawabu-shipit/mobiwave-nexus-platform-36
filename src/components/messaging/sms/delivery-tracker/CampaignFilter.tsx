
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CampaignDelivery {
  id: string;
  name: string;
  status: 'preparing' | 'sending' | 'completed' | 'failed';
  totalRecipients: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  startTime: Date;
  estimatedCompletion?: Date;
  deliveryStatuses: any[];
}

interface CampaignFilterProps {
  selectedCampaign: string;
  onCampaignChange: (value: string) => void;
  deliveries: CampaignDelivery[];
}

export function CampaignFilter({ selectedCampaign, onCampaignChange, deliveries }: CampaignFilterProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Campaign:</label>
          <Select value={selectedCampaign} onValueChange={onCampaignChange}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {deliveries.map(delivery => (
                <SelectItem key={delivery.id} value={delivery.id}>
                  {delivery.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
