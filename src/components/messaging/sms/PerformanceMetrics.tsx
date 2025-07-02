
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

interface PerformanceMetricsProps {
  metrics: PerformanceMetric[];
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{metric.name}</h4>
              <Badge className={getStatusColor(metric.status)}>
                {metric.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {metric.value}{metric.unit}
                </span>
                <span className="text-sm text-gray-500">
                  Target: {metric.target}{metric.unit}
                </span>
              </div>
              <Progress 
                value={Math.min((metric.value / metric.target) * 100, 100)}
                className="h-2"
              />
              <p className="text-xs text-gray-600">{metric.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
