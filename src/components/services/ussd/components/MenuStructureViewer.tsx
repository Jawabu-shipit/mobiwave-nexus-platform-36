
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { USSDApplication, SessionStep } from '../types';

interface MenuStructureViewerProps {
  application: USSDApplication;
  currentNodeId: string | null;
  sessionHistory: SessionStep[];
}

export function MenuStructureViewer({ 
  application, 
  currentNodeId, 
  sessionHistory 
}: MenuStructureViewerProps) {
  return (
    <div className="space-y-4 overflow-y-auto">
      <h3 className="font-semibold">Menu Structure</h3>
      {application.menu_structure.map((node, index) => (
        <Card 
          key={node.id} 
          className={`p-3 transition-colors ${
            currentNodeId === node.id ? 'border-blue-500 bg-blue-50' : 
            sessionHistory.some(step => step.nodeId === node.id) ? 'border-green-500 bg-green-50' : ''
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {node.id === 'root' ? 'Root Menu' : `Menu ${index + 1}`}
              </Badge>
              <div className="flex gap-1">
                {currentNodeId === node.id && (
                  <Badge variant="default" className="text-xs bg-blue-500">Current</Badge>
                )}
                {sessionHistory.some(step => step.nodeId === node.id) && currentNodeId !== node.id && (
                  <Badge variant="outline" className="text-xs border-green-500 text-green-600">Visited</Badge>
                )}
                <Badge variant={node.isEndNode ? 'destructive' : 'default'} className="text-xs">
                  {node.isEndNode ? 'End' : 'Menu'}
                </Badge>
              </div>
            </div>
            <div className="text-sm">
              <strong>Text:</strong> {node.text}
            </div>
            {!node.isEndNode && (
              <div className="text-sm">
                <strong>Options:</strong>
                <ul className="list-disc list-inside ml-2 text-xs">
                  {node.options.map((option, optIndex) => (
                    <li key={optIndex}>{optIndex + 1}. {option}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
