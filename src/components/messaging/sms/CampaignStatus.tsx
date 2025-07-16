
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CampaignStatusProps {
  checkBalance: () => Promise<any>;
}

export function CampaignStatus({ checkBalance }: CampaignStatusProps) {
  const [balance, setBalance] = React.useState<any>(null);

  React.useEffect(() => {
    checkBalance().then(setBalance).catch(console.error);
  }, [checkBalance]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Balance</p>
            <p className="text-lg font-semibold">
              {balance ? `$${balance.balance}` : 'Loading...'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-lg font-semibold text-green-600">Active</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
