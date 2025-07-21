
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, RefreshCw } from 'lucide-react';

interface OptimizationControlsProps {
  onOptimize: () => void;
  isOptimizing: boolean;
  lastOptimized: Date | null;
  overallScore: number;
}

export function OptimizationControls({ 
  onOptimize, 
  isOptimizing, 
  lastOptimized, 
  overallScore 
}: OptimizationControlsProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Performance Monitor
            </CardTitle>
            <CardDescription>
              Real-time system performance metrics and optimization tools
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{overallScore}%</div>
            <div className="text-sm text-gray-600">Performance Score</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">System Optimization</h3>
            <p className="text-sm text-gray-600">
              Run automated optimization to improve performance
            </p>
            {lastOptimized && (
              <p className="text-xs text-gray-500">
                Last optimized: {lastOptimized.toLocaleString()}
              </p>
            )}
          </div>
          <Button
            onClick={onOptimize}
            disabled={isOptimizing}
            className="flex items-center gap-2"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Run Optimization
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
