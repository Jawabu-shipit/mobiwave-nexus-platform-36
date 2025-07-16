
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from 'lucide-react';

interface RefreshControlsProps {
  refreshInterval: number;
  onRefreshIntervalChange: (value: number) => void;
  autoRefresh: boolean;
  onAutoRefreshToggle: () => void;
}

export function RefreshControls({ 
  refreshInterval, 
  onRefreshIntervalChange, 
  autoRefresh, 
  onAutoRefreshToggle 
}: RefreshControlsProps) {
  return (
    <div className="flex gap-2">
      <Select value={refreshInterval.toString()} onValueChange={(value) => onRefreshIntervalChange(parseInt(value))}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 second</SelectItem>
          <SelectItem value="5">5 seconds</SelectItem>
          <SelectItem value="10">10 seconds</SelectItem>
          <SelectItem value="30">30 seconds</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant={autoRefresh ? "default" : "outline"}
        onClick={onAutoRefreshToggle}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
        Auto Refresh
      </Button>
    </div>
  );
}
