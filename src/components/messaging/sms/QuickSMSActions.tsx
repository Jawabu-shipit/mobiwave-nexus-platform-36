
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Clock } from 'lucide-react';

interface QuickSMSActionsProps {
  scheduledFor: string;
  isLoading: boolean;
  canSend: boolean;
  onSend: () => void;
  onSchedule: () => void;
}

export function QuickSMSActions({ 
  scheduledFor, 
  isLoading, 
  canSend, 
  onSend, 
  onSchedule 
}: QuickSMSActionsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {scheduledFor ? (
            <Button 
              onClick={onSchedule} 
              className="w-full flex items-center gap-2"
              disabled={isLoading || !canSend}
            >
              <Clock className="w-4 h-4" />
              Schedule SMS
            </Button>
          ) : (
            <Button 
              onClick={onSend} 
              className="w-full flex items-center gap-2"
              disabled={isLoading || !canSend}
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Sending...' : 'Send Now'}
            </Button>
          )}
          
          <div className="text-xs text-gray-500 text-center">
            {scheduledFor ? 'Message will be sent at the scheduled time' : 'Message will be sent immediately'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
