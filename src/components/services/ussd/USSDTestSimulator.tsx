
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Phone } from 'lucide-react';
import { USSDApplication, SessionStep } from './types';
import { PhoneSimulator } from './components/PhoneSimulator';
import { MenuStructureViewer } from './components/MenuStructureViewer';

interface USSDTestSimulatorProps {
  application: USSDApplication;
  onClose: () => void;
}

export function USSDTestSimulator({ application, onClose }: USSDTestSimulatorProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionStep[]>([]);
  const [userInput, setUserInput] = useState('');
  const [sessionActive, setSessionActive] = useState(false);

  const getRootNode = () => {
    return application.menu_structure.find(node => node.id === 'root') || application.menu_structure[0];
  };

  const startSession = () => {
    const rootNode = getRootNode();
    if (rootNode) {
      setCurrentNodeId(rootNode.id);
      setSessionHistory([{ nodeId: rootNode.id, timestamp: Date.now() }]);
      setSessionActive(true);
      setUserInput('');
    }
  };

  const handleUserInput = (input: string) => {
    const currentNode = application.menu_structure.find(node => node.id === currentNodeId);
    if (!currentNode || currentNode.isEndNode || !sessionActive) return;

    const optionIndex = parseInt(input) - 1;
    
    if (optionIndex >= 0 && optionIndex < currentNode.options.length) {
      const selectedOption = currentNode.options[optionIndex];
      
      const newStep: SessionStep = {
        nodeId: currentNode.id,
        input: input,
        timestamp: Date.now()
      };
      
      const updatedHistory = [...sessionHistory, newStep];
      setSessionHistory(updatedHistory);
      
      // Simple navigation logic
      const nextNode = application.menu_structure.find(node => 
        node.id !== currentNode.id && 
        (node.text.toLowerCase().includes(selectedOption.toLowerCase()) ||
         node.id.toLowerCase().includes(selectedOption.toLowerCase().replace(/\s+/g, '_')))
      );
      
      if (nextNode) {
        setCurrentNodeId(nextNode.id);
        setSessionHistory([...updatedHistory, { nodeId: nextNode.id, timestamp: Date.now() }]);
      } else {
        setSessionActive(false);
      }
    } else {
      const errorStep: SessionStep = {
        nodeId: currentNode.id,
        input: `INVALID:${input}`,
        timestamp: Date.now()
      };
      setSessionHistory([...sessionHistory, errorStep]);
    }
    
    setUserInput('');
  };

  const goBack = () => {
    if (sessionHistory.length > 1) {
      const newHistory = sessionHistory.slice(0, -1);
      const previousStep = newHistory[newHistory.length - 1];
      setSessionHistory(newHistory);
      setCurrentNodeId(previousStep.nodeId);
      setSessionActive(true);
    }
  };

  const resetSession = () => {
    setCurrentNodeId(null);
    setSessionHistory([]);
    setUserInput('');
    setSessionActive(false);
  };

  return (
    <Card className="fixed inset-4 z-50 bg-white shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          USSD Simulator - {application.service_code}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={sessionActive ? "default" : "outline"}>
            {sessionActive ? "Active Session" : "Session Ended"}
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-96">
          <PhoneSimulator
            application={application}
            sessionHistory={sessionHistory}
            sessionActive={sessionActive}
            userInput={userInput}
            currentNodeId={currentNodeId}
            onInputChange={setUserInput}
            onSendInput={handleUserInput}
            onGoBack={goBack}
            onReset={resetSession}
            onStartSession={startSession}
          />
          <MenuStructureViewer
            application={application}
            currentNodeId={currentNodeId}
            sessionHistory={sessionHistory}
          />
        </div>
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <strong>How to test:</strong> Click "Start Session" to begin testing your USSD flow. 
          Enter option numbers to navigate through the menu.
        </div>
      </CardContent>
    </Card>
  );
}
