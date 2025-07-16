
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from 'lucide-react';

interface SubUsersHeaderProps {
  onRefresh: () => void;
  onTopUp: () => void;
  isLoading: boolean;
}

export function SubUsersHeader({ onRefresh, onTopUp, isLoading }: SubUsersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-bold">Sub Users & Reseller Clients</h3>
        <p className="text-gray-600">Manage sub accounts and reseller client balances</p>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
        
        <Button onClick={onTopUp} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Top Up Account
        </Button>
      </div>
    </div>
  );
}
