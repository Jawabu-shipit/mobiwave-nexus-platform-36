
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Zap, GitBranch, Play, Clock } from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  name: string;
  config: any;
  position: { x: number; y: number };
}

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  onRemoveNode: (nodeId: string) => void;
}

export function WorkflowCanvas({ nodes, onRemoveNode }: WorkflowCanvasProps) {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'trigger': return <Zap className="w-4 h-4" />;
      case 'condition': return <GitBranch className="w-4 h-4" />;
      case 'action': return <Play className="w-4 h-4" />;
      case 'delay': return <Clock className="w-4 h-4" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'trigger': return 'border-blue-500 bg-blue-50';
      case 'condition': return 'border-yellow-500 bg-yellow-50';
      case 'action': return 'border-green-500 bg-green-50';
      case 'delay': return 'border-purple-500 bg-purple-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="border rounded-lg p-6 min-h-96 bg-gray-50 relative">
      <h3 className="text-lg font-medium mb-4">Workflow Canvas</h3>
      
      {nodes.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Start building your workflow by adding nodes above</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {nodes.map((node, index) => (
            <div key={node.id} className="flex items-center gap-4">
              <Card className={`${getNodeColor(node.type)} border-2`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getNodeIcon(node.type)}
                      <div>
                        <h4 className="font-medium">{node.name}</h4>
                        <p className="text-xs text-gray-600 capitalize">{node.type}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveNode(node.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {index < nodes.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-300"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
