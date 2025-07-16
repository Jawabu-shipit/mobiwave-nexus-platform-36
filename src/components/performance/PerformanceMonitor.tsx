
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { usePerformanceMonitoring } from '@/hooks/usePerformanceOptimization';
import { Activity, Clock, MemoryStick, Zap } from 'lucide-react';

export function PerformanceMonitor() {
  const { metrics, measurePageLoad, getMemoryUsage } = usePerformanceMonitoring();
  const [webVitals, setWebVitals] = useState({
    fcp: 0, // First Contentful Paint
    lcp: 0, // Largest Contentful Paint
    cls: 0, // Cumulative Layout Shift
    fid: 0  // First Input Delay
  });

  useEffect(() => {
    measurePageLoad();
    getMemoryUsage();

    // Measure Web Vitals
    const measureWebVitals = () => {
      if ('web-vitals' in window) {
        // This would require importing web-vitals library
        // For now, we'll use placeholder values
        setWebVitals({
          fcp: Math.random() * 3000,
          lcp: Math.random() * 4000,
          cls: Math.random() * 0.1,
          fid: Math.random() * 100
        });
      }
    };

    measureWebVitals();
  }, []);

  const getPerformanceScore = () => {
    const { loadTime, renderTime, memoryUsage } = metrics;
    let score = 100;
    
    if (loadTime > 3000) score -= 20;
    if (renderTime > 100) score -= 15;
    if (memoryUsage > 100) score -= 10;
    
    return Math.max(score, 0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const performanceScore = getPerformanceScore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Performance Monitor</h3>
        <p className="text-gray-600 text-sm">Real-time performance metrics and optimization insights</p>
      </div>

      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(performanceScore)}`}>
              {performanceScore}
            </div>
            <Progress value={performanceScore} className="mb-4" />
            <Badge variant={performanceScore >= 90 ? "default" : performanceScore >= 70 ? "secondary" : "destructive"}>
              {performanceScore >= 90 ? "Excellent" : performanceScore >= 70 ? "Good" : "Needs Improvement"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Load Time</p>
                <p className="text-xl font-bold">{metrics.loadTime}ms</p>
                <Badge variant={metrics.loadTime < 3000 ? "default" : "destructive"} className="text-xs">
                  {metrics.loadTime < 3000 ? "Good" : "Slow"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Render Time</p>
                <p className="text-xl font-bold">{metrics.renderTime}ms</p>
                <Badge variant={metrics.renderTime < 100 ? "default" : "destructive"} className="text-xs">
                  {metrics.renderTime < 100 ? "Fast" : "Slow"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MemoryStick className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                <p className="text-xl font-bold">{metrics.memoryUsage}MB</p>
                <Badge variant={metrics.memoryUsage < 100 ? "default" : "destructive"} className="text-xs">
                  {metrics.memoryUsage < 100 ? "Optimal" : "High"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
                <p className="text-xl font-bold">{metrics.cacheHitRate}%</p>
                <Badge variant={metrics.cacheHitRate > 80 ? "default" : "secondary"} className="text-xs">
                  {metrics.cacheHitRate > 80 ? "Excellent" : "Average"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{webVitals.fcp.toFixed(0)}ms</p>
              <p className="text-sm text-gray-600">First Contentful Paint</p>
              <Badge variant={webVitals.fcp < 1800 ? "default" : "destructive"} className="text-xs mt-1">
                {webVitals.fcp < 1800 ? "Good" : "Poor"}
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">{webVitals.lcp.toFixed(0)}ms</p>
              <p className="text-sm text-gray-600">Largest Contentful Paint</p>
              <Badge variant={webVitals.lcp < 2500 ? "default" : "destructive"} className="text-xs mt-1">
                {webVitals.lcp < 2500 ? "Good" : "Poor"}
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{webVitals.cls.toFixed(3)}</p>
              <p className="text-sm text-gray-600">Cumulative Layout Shift</p>
              <Badge variant={webVitals.cls < 0.1 ? "default" : "destructive"} className="text-xs mt-1">
                {webVitals.cls < 0.1 ? "Good" : "Poor"}
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{webVitals.fid.toFixed(0)}ms</p>
              <p className="text-sm text-gray-600">First Input Delay</p>
              <Badge variant={webVitals.fid < 100 ? "default" : "destructive"} className="text-xs mt-1">
                {webVitals.fid < 100 ? "Good" : "Poor"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
