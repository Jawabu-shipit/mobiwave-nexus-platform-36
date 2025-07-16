
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface PersonalizationPanelProps {
  characterCount: number;
  smsCount: number;
  onInsertPersonalization: (key: string) => void;
}

export function PersonalizationPanel({ characterCount, smsCount, onInsertPersonalization }: PersonalizationPanelProps) {
  const personalizations = [
    { key: '{firstName}', label: 'First Name' },
    { key: '{lastName}', label: 'Last Name' },
    { key: '{company}', label: 'Company' },
    { key: '{phone}', label: 'Phone Number' },
    { key: '{customField1}', label: 'Custom Field 1' },
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5 text-purple-600" />
          Personalization
        </CardTitle>
        <CardDescription>
          Click to insert variables into your message
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {personalizations.map((item, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="w-full justify-start text-left"
            onClick={() => onInsertPersonalization(item.key)}
          >
            <span className="font-mono text-blue-600">{item.key}</span>
            <span className="ml-2 text-gray-600">{item.label}</span>
          </Button>
        ))}
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">Message Statistics</Label>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Characters:</span>
              <span>{characterCount}</span>
            </div>
            <div className="flex justify-between">
              <span>SMS Count:</span>
              <span>{smsCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Cost Estimate:</span>
              <span>${(smsCount * 0.05).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
