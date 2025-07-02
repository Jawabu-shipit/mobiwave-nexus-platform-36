
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, ArrowLeft, RotateCcw } from 'lucide-react';
import { USSDApplication, SessionStep, MenuNode } from '../types';

interface PhoneSimulatorProps {
  application: USSDApplication;
  sessionHistory: SessionStep[];
  sessionActive: boolean;
  userInput: string;
  currentNodeId: string | null;
  onInputChange: (value: string) => void;
  onSendInput: (input: string) => void;
  onGoBack: () => void;
  onReset: () => void;
  onStartSession: () => void;
}

export function PhoneSimulator({
  application,
  sessionHistory,
  sessionActive,
  userInput,
  currentNodeId,
  onInputChange,
  onSendInput,
  onGoBack,
  onReset,
  onStartSession
}: PhoneSimulatorProps) {
  const getCurrentNode = (): MenuNode | null => {
    if (!currentNodeId) return null;
    return application.menu_structure.find(node => node.id === currentNodeId) || null;
  };

  const renderSessionDisplay = () => {
    if (!sessionActive && sessionHistory.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-green-400 rounded-full flex items-center justify-center">
            📱
          </div>
          <p className="text-green-400 mb-4">USSD Session Ready</p>
          <p className="text-sm text-gray-400">Dial {application.service_code} to start</p>
          <Button onClick={onStartSession} className="mt-4" size="sm">
            <Play className="w-4 h-4 mr-2" />
            Start Session
          </Button>
        </div>
      );
    }

    const currentNode = getCurrentNode();
    
    return (
      <div className="space-y-3">
        {sessionHistory.map((step, index) => {
          const node = application.menu_structure.find(n => n.id === step.nodeId);
          const isCurrentStep = index === sessionHistory.length - 1 && sessionActive;
          
          return (
            <div key={index} className={`border-b border-green-600 pb-2 ${isCurrentStep ? 'border-yellow-400' : ''}`}>
              <div className="text-white mb-2">{node?.text}</div>
              
              {!node?.isEndNode && (
                <div className="space-y-1 text-sm">
                  {node?.options.map((option, optIndex) => (
                    <div key={optIndex} className="text-green-300">
                      {optIndex + 1}. {option}
                    </div>
                  ))}
                </div>
              )}
              
              {step.input && (
                <div className="mt-2">
                  {step.input.startsWith('INVALID:') ? (
                    <div className="text-red-400">Invalid input: {step.input.replace('INVALID:', '')}</div>
                  ) : (
                    <div className="text-yellow-400">You entered: {step.input}</div>
                  )}
                </div>
              )}
              
              {node?.isEndNode && (
                <div className="text-yellow-400 mt-2 text-sm">Session ended</div>
              )}
            </div>
          );
        })}
        
        {!sessionActive && sessionHistory.length > 0 && (
          <div className="text-yellow-400 text-center py-4">
            Session Terminated
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm overflow-y-auto">
      <div className="bg-black p-3 rounded mb-4">
        <div className="text-center text-xs mb-2 text-green-300">
          USSD Session - {application.service_code}
        </div>
        <div className="border border-green-400 p-2 min-h-[200px]">
          {renderSessionDisplay()}
        </div>
      </div>
      
      {/* Input Area */}
      {sessionActive && getCurrentNode() && !getCurrentNode()?.isEndNode && (
        <div className="space-y-2">
          <Input
            value={userInput}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter option number..."
            className="bg-gray-800 border-green-400 text-green-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSendInput(userInput);
              }
            }}
          />
          <div className="flex gap-2">
            <Button 
              onClick={() => onSendInput(userInput)} 
              size="sm"
              disabled={!userInput.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              Send
            </Button>
            <Button onClick={onGoBack} size="sm" variant="outline" disabled={sessionHistory.length <= 1}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button onClick={onReset} size="sm" variant="outline">
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      )}

      {!sessionActive && sessionHistory.length > 0 && (
        <div className="text-center">
          <Button onClick={onStartSession} size="sm" className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Start New Session
          </Button>
        </div>
      )}
    </div>
  );
}
