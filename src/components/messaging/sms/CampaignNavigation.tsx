
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

interface CampaignNavigationProps {
  currentStep: number;
  totalSteps: number;
  isStepValid: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onLaunch: () => void;
  isLaunching: boolean;
}

export function CampaignNavigation({
  currentStep,
  totalSteps,
  isStepValid,
  onNext,
  onPrevious,
  onLaunch,
  isLaunching
}: CampaignNavigationProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>

          {currentStep < totalSteps ? (
            <Button
              onClick={onNext}
              disabled={!isStepValid}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={onLaunch}
              disabled={!isStepValid || isLaunching}
              className="flex items-center gap-2"
            >
              {isLaunching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Launching...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Launch Campaign
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
