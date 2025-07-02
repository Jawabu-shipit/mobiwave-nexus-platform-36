
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { WorkflowHeader } from './workflow-builder/WorkflowHeader';
import { WorkflowCanvas } from './workflow-builder/WorkflowCanvas';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  name: string;
  config: any;
  position: { x: number; y: number };
}

export function WorkflowBuilder() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: '1',
      type: 'trigger',
      name: 'User Registration',
      config: { event: 'user_created' },
      position: { x: 100, y: 100 }
    }
  ]);

  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');

  const addNode = (type: WorkflowNode['type']) => {
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type,
      name: `New ${type}`,
      config: {},
      position: { x: 200, y: 200 }
    };
    setNodes(prev => [...prev, newNode]);
  };

  const removeNode = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
  };

  return (
    <div className="space-y-6">
      <WorkflowHeader
        workflowName={workflowName}
        workflowDescription={workflowDescription}
        onWorkflowNameChange={setWorkflowName}
        onWorkflowDescriptionChange={setWorkflowDescription}
        onAddNode={addNode}
      />

      <WorkflowCanvas
        nodes={nodes}
        onRemoveNode={removeNode}
      />

      <div className="flex justify-end gap-2">
        <Button variant="outline">Save as Template</Button>
        <Button>Save Workflow</Button>
      </div>
    </div>
  );
}
