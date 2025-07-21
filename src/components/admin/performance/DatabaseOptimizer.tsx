
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface QueryOptimization {
  id: string;
  query: string;
  executionTime: number;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
}

export function DatabaseOptimizer() {
  const [optimizations] = useState<QueryOptimization[]>([
    {
      id: '1',
      query: 'SELECT * FROM user_services_overview WHERE user_id = ?',
      executionTime: 245,
      frequency: 1200,
      impact: 'high',
      suggestion: 'Add index on user_id column'
    },
    {
      id: '2',
      query: 'SELECT COUNT(*) FROM campaigns WHERE status = ?',
      executionTime: 120,
      frequency: 800,
      impact: 'medium',
      suggestion: 'Add composite index on (status, created_at)'
    },
    {
      id: '3',
      query: 'SELECT * FROM analytics_events ORDER BY created_at DESC',
      executionTime: 89,
      frequency: 600,
      impact: 'low',
      suggestion: 'Consider partitioning by date'
    }
  ]);

  const [isOptimizing, setIsOptimizing] = useState(false);

  const runOptimization = async (optimizationId: string) => {
    setIsOptimizing(true);
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsOptimizing(false);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              Total Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,891</div>
            <p className="text-xs text-gray-600">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156ms</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              12% improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Optimization Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">87%</div>
              <Progress value={87} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Query Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizations.map((opt) => (
              <div key={opt.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getImpactColor(opt.impact)}>
                        {opt.impact} impact
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {opt.executionTime}ms avg • {opt.frequency} calls/day
                      </span>
                    </div>
                    <code className="text-sm bg-gray-100 p-2 rounded block mb-2">
                      {opt.query}
                    </code>
                    <p className="text-sm text-gray-700">{opt.suggestion}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => runOptimization(opt.id)}
                    disabled={isOptimizing}
                  >
                    {isOptimizing ? 'Optimizing...' : 'Optimize'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Health Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Connection Pool</div>
                <div className="text-sm text-gray-600">Healthy (12/20 connections)</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Index Usage</div>
                <div className="text-sm text-gray-600">95% queries using indexes</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="font-medium">Disk Space</div>
                <div className="text-sm text-gray-600">78% used (cleanup recommended)</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Backup Status</div>
                <div className="text-sm text-gray-600">Last backup: 2 hours ago</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
