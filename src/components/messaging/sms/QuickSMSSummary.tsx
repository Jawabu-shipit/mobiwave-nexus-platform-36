
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from 'lucide-react';
import { useUserCredits } from '@/hooks/useUserCredits';

interface QuickSMSSummaryProps {
  recipients: string[];
  message: string;
  estimatedCost: number;
}

export function QuickSMSSummary({ recipients, message, estimatedCost }: QuickSMSSummaryProps) {
  const { data: credits } = useUserCredits();
  const smsCount = Math.ceil(message.length / 160);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Recipients:</span>
          <Badge variant="secondary">{recipients.length}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">SMS Count:</span>
          <Badge variant="secondary">{smsCount} per recipient</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total SMS:</span>
          <Badge variant="secondary">{recipients.length * smsCount}</Badge>
        </div>
        <div className="flex justify-between pt-2 border-t">
          <span className="text-sm font-medium">Estimated Cost:</span>
          <Badge variant="outline">${estimatedCost.toFixed(2)}</Badge>
        </div>
        {credits && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Available Credits:</span>
            <Badge variant={credits.credits_remaining >= estimatedCost ? "secondary" : "destructive"}>
              ${credits.credits_remaining.toFixed(2)}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
