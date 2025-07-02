
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TopUpData {
  clientname: string;
  noOfSms: number;
  type: string;
}

interface TopUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  topUpData: TopUpData;
  setTopUpData: React.Dispatch<React.SetStateAction<TopUpData>>;
  onTopUp: () => void;
  isLoading: boolean;
}

export function TopUpDialog({ 
  isOpen, 
  onClose, 
  topUpData, 
  setTopUpData, 
  onTopUp, 
  isLoading 
}: TopUpDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Top Up Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="accountType">Account Type</Label>
            <select
              id="accountType"
              value={topUpData.type}
              onChange={(e) => setTopUpData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full p-2 border rounded-md"
            >
              <option value="subAccount">Sub Account</option>
              <option value="resellerClient">Reseller Client</option>
            </select>
          </div>
          <div>
            <Label htmlFor="clientname">Client Name</Label>
            <Input
              id="clientname"
              value={topUpData.clientname}
              onChange={(e) => setTopUpData(prev => ({ ...prev, clientname: e.target.value }))}
              placeholder="Enter client name"
            />
          </div>
          <div>
            <Label htmlFor="smsCount">SMS Credits</Label>
            <Input
              id="smsCount"
              type="number"
              value={topUpData.noOfSms}
              onChange={(e) => setTopUpData(prev => ({ ...prev, noOfSms: parseInt(e.target.value) || 0 }))}
              placeholder="Enter SMS quantity"
              min="1"
            />
          </div>
          <Button 
            onClick={onTopUp} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Top Up Account'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
