
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from 'lucide-react';

export function EmptyState() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No active delivery campaigns</p>
        <p className="text-sm text-gray-400">Start a campaign to see real-time delivery tracking</p>
      </CardContent>
    </Card>
  );
}
