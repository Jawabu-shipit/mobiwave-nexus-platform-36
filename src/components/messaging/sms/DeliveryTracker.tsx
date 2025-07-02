
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DeliveryStatsCards } from './delivery-tracker/DeliveryStatsCards';
import { CampaignFilter } from './delivery-tracker/CampaignFilter';
import { DeliveryStatusCard } from './delivery-tracker/DeliveryStatusCard';
import { EmptyState } from './delivery-tracker/EmptyState';
import { RefreshControls } from './delivery-tracker/RefreshControls';

interface DeliveryStatus {
  id: string;
  recipient: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'unsubscribed';
  timestamp: Date;
  errorMessage?: string;
  deliveryTime?: number; // seconds
}

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
  deliveryStatuses: DeliveryStatus[];
}

interface DeliveryTrackerProps {
  campaigns?: any[];
}

export function DeliveryTracker({ campaigns = [] }: DeliveryTrackerProps) {
  const [deliveries, setDeliveries] = useState<CampaignDelivery[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds

  // Mock data for demonstration
  useEffect(() => {
    const mockDeliveries: CampaignDelivery[] = [
      {
        id: '1',
        name: 'Black Friday Sale Alert',
        status: 'sending',
        totalRecipients: 10000,
        sent: 7500,
        delivered: 7200,
        failed: 150,
        pending: 2500,
        startTime: new Date(Date.now() - 15 * 60 * 1000), // Started 15 minutes ago
        estimatedCompletion: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        deliveryStatuses: []
      },
      {
        id: '2',
        name: 'Payment Reminder',
        status: 'completed',
        totalRecipients: 500,
        sent: 500,
        delivered: 485,
        failed: 15,
        pending: 0,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Started 2 hours ago
        deliveryStatuses: []
      },
      {
        id: '3',
        name: 'Weekly Newsletter',
        status: 'preparing',
        totalRecipients: 25000,
        sent: 0,
        delivered: 0,
        failed: 0,
        pending: 25000,
        startTime: new Date(),
        deliveryStatuses: []
      }
    ];

    setDeliveries(mockDeliveries);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setDeliveries(prev => prev.map(delivery => {
        if (delivery.status === 'sending') {
          const progress = Math.min(delivery.sent + Math.floor(Math.random() * 100), delivery.totalRecipients);
          const delivered = Math.floor(progress * 0.96); // 96% delivery rate
          const failed = progress - delivered;
          
          return {
            ...delivery,
            sent: progress,
            delivered,
            failed,
            pending: delivery.totalRecipients - progress,
            status: progress >= delivery.totalRecipients ? 'completed' : 'sending'
          };
        }
        return delivery;
      }));
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const filteredDeliveries = selectedCampaign === 'all' 
    ? deliveries 
    : deliveries.filter(d => d.id === selectedCampaign);

  const totalStats = deliveries.reduce((acc, delivery) => ({
    totalRecipients: acc.totalRecipients + delivery.totalRecipients,
    sent: acc.sent + delivery.sent,
    delivered: acc.delivered + delivery.delivered,
    failed: acc.failed + delivery.failed,
    pending: acc.pending + delivery.pending
  }), { totalRecipients: 0, sent: 0, delivered: 0, failed: 0, pending: 0 });

  const overallDeliveryRate = totalStats.sent > 0 ? (totalStats.delivered / totalStats.sent) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Delivery Tracking</h2>
          <p className="text-gray-600">Real-time monitoring of campaign delivery status</p>
        </div>
        <RefreshControls
          refreshInterval={refreshInterval}
          onRefreshIntervalChange={setRefreshInterval}
          autoRefresh={autoRefresh}
          onAutoRefreshToggle={() => setAutoRefresh(!autoRefresh)}
        />
      </div>

      <DeliveryStatsCards 
        totalStats={totalStats} 
        overallDeliveryRate={overallDeliveryRate} 
      />

      <CampaignFilter
        selectedCampaign={selectedCampaign}
        onCampaignChange={setSelectedCampaign}
        deliveries={deliveries}
      />

      <div className="space-y-4">
        {filteredDeliveries.map(delivery => (
          <DeliveryStatusCard key={delivery.id} delivery={delivery} />
        ))}
      </div>

      {filteredDeliveries.length === 0 && <EmptyState />}
    </div>
  );
}
