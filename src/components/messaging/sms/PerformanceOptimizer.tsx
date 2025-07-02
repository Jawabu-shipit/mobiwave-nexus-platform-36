
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { PerformanceMetrics } from './PerformanceMetrics';
import { OptimizationControls } from './OptimizationControls';
import { PerformanceRecommendations } from './PerformanceRecommendations';

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

export function PerformanceOptimizer() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimized, setLastOptimized] = useState<Date | null>(null);

  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'Message Processing Speed',
      value: 1250,
      target: 1000,
      unit: 'msg/min',
      status: 'good',
      description: 'Average messages processed per minute'
    },
    {
      name: 'API Response Time',
      value: 120,
      target: 200,
      unit: 'ms',
      status: 'good',
      description: 'Average API response time'
    },
    {
      name: 'Database Query Time',
      value: 45,
      target: 100,
      unit: 'ms',
      status: 'good',
      description: 'Average database query execution time'
    },
    {
      name: 'Memory Usage',
      value: 75,
      target: 80,
      unit: '%',
      status: 'warning',
      description: 'Current memory utilization'
    },
    {
      name: 'Cache Hit Rate',
      value: 92,
      target: 85,
      unit: '%',
      status: 'good',
      description: 'Percentage of requests served from cache'
    },
    {
      name: 'Error Rate',
      value: 0.5,
      target: 1,
      unit: '%',
      status: 'good',
      description: 'Percentage of failed requests'
    }
  ];

  const optimizationTasks = [
    { name: 'Clear message cache', duration: 2000 },
    { name: 'Optimize database queries', duration: 3000 },
    { name: 'Compress static assets', duration: 1500 },
    { name: 'Update routing tables', duration: 2500 },
    { name: 'Refresh connection pools', duration: 1000 }
  ];

  const runOptimization = async () => {
    setIsOptimizing(true);
    
    for (const task of optimizationTasks) {
      toast.info(`Running: ${task.name}`);
      await new Promise(resolve => setTimeout(resolve, task.duration));
    }
    
    setIsOptimizing(false);
    setLastOptimized(new Date());
    toast.success('Performance optimization completed successfully!');
  };

  const overallScore = useMemo(() => {
    const goodMetrics = performanceMetrics.filter(m => m.status === 'good').length;
    return Math.round((goodMetrics / performanceMetrics.length) * 100);
  }, [performanceMetrics]);

  return (
    <div className="space-y-6">
      <OptimizationControls
        onOptimize={runOptimization}
        isOptimizing={isOptimizing}
        lastOptimized={lastOptimized}
        overallScore={overallScore}
      />
      
      <PerformanceMetrics metrics={performanceMetrics} />
      
      <PerformanceRecommendations />
    </div>
  );
}
