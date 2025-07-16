
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from 'lucide-react';

interface EmptyTemplateStateProps {
  onCreateTemplate: () => void;
}

export function EmptyTemplateState({ onCreateTemplate }: EmptyTemplateStateProps) {
  return (
    <div className="text-center py-8">
      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <h4 className="text-lg font-semibold mb-2">No Templates Yet</h4>
      <p className="text-gray-600 mb-4">
        Create your first message template to start sending WhatsApp messages.
      </p>
      <Button onClick={onCreateTemplate}>
        <Plus className="w-4 h-4 mr-2" />
        Create Template
      </Button>
    </div>
  );
}
