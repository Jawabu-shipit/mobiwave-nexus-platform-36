
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface CampaignStepsProps {
  currentStep: number;
  steps: Step[];
}

export function CampaignSteps({ currentStep, steps }: CampaignStepsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep > step.id 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : currentStep === step.id 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
