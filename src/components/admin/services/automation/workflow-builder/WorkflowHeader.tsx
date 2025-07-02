
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from 'lucide-react';

interface WorkflowHeaderProps {
  workflowName: string;
  workflowDescription: string;
  onWorkflowNameChange: (name: string) => void;
  onWorkflowDescriptionChange: (description: string) => void;
  onAddNode: (type: 'trigger' | 'condition' | 'action' | 'delay') => void;
}

export function WorkflowHeader({
  workflowName,
  workflowDescription,
  onWorkflowNameChange,
  onWorkflowDescriptionChange,
  onAddNode
}: WorkflowHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="workflow-name">Workflow Name</Label>
          <Input
            id="workflow-name"
            value={workflowName}
            onChange={(e) => onWorkflowNameChange(e.target.value)}
            placeholder="Enter workflow name..."
          />
        </div>
        <div>
          <Label htmlFor="workflow-description">Description</Label>
          <Textarea
            id="workflow-description"
            value={workflowDescription}
            onChange={(e) => onWorkflowDescriptionChange(e.target.value)}
            placeholder="Describe what this workflow does..."
            rows={2}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onAddNode('trigger')} className="flex items-center gap-1">
          <Plus className="w-3 h-3" />
          Add Trigger
        </Button>
        <Button size="sm" onClick={() => onAddNode('condition')} className="flex items-center gap-1">
          <Plus className="w-3 h-3" />
          Add Condition
        </Button>
        <Button size="sm" onClick={() => onAddNode('action')} className="flex items-center gap-1">
          <Plus className="w-3 h-3" />
          Add Action
        </Button>
        <Button size="sm" onClick={() => onAddNode('delay')} className="flex items-center gap-1">
          <Plus className="w-3 h-3" />
          Add Delay
        </Button>
      </div>
    </div>
  );
}
