
import React from 'react';
import { Button } from "@/components/ui/button";
import { Power, PowerOff, Loader2 } from 'lucide-react';

interface UserServiceActionsProps {
  userId: string;
  serviceId: string;
  isActivated: boolean;
  isEligible: boolean;
  onToggle: (params: { userId: string; serviceId: string; operation: 'activate' | 'deactivate' }) => Promise<any>;
  isLoading: boolean;
}

export function UserServiceActions({ 
  userId, 
  serviceId, 
  isActivated, 
  isEligible, 
  onToggle, 
  isLoading 
}: UserServiceActionsProps) {
  if (!isEligible) {
    return (
      <Button size="sm" variant="ghost" disabled className="h-6 px-2">
        <span className="text-xs text-gray-400">N/A</span>
      </Button>
    );
  }

  const handleToggle = async () => {
    await onToggle({
      userId,
      serviceId,
      operation: isActivated ? 'deactivate' : 'activate'
    });
  };

  return (
    <Button
      size="sm"
      variant={isActivated ? "outline" : "default"}
      onClick={handleToggle}
      disabled={isLoading}
      className="h-6 px-2"
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isActivated ? (
        <>
          <PowerOff className="w-3 h-3 mr-1" />
          <span className="text-xs">Deactivate</span>
        </>
      ) : (
        <>
          <Power className="w-3 h-3 mr-1" />
          <span className="text-xs">Activate</span>
        </>
      )}
    </Button>
  );
}
