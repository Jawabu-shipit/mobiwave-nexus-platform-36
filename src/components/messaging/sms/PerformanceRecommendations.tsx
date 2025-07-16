
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Database, Clock, TrendingUp } from 'lucide-react';

export function PerformanceRecommendations() {
  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Performance Recommendations
        </CardTitle>
        <CardDescription>
          Automated suggestions to improve system performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Cache Optimization Active</h4>
              <p className="text-sm text-green-700">Your cache hit rate is excellent at 92%</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <Database className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">Consider Memory Cleanup</h4>
              <p className="text-sm text-yellow-700">Memory usage is at 75%. Consider running cleanup routines.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Schedule Optimization</h4>
              <p className="text-sm text-blue-700">Run optimization during off-peak hours for better results.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
