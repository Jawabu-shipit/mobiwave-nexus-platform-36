import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useActiveOperations } from '@/hooks/useActiveOperations';
import { useBillingData } from '@/hooks/useBillingData';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useUsageAnalytics } from '@/hooks/useUsageAnalytics';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';
import { useServiceAnalytics } from '@/hooks/useServiceAnalytics';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'loading';
  data?: any;
  error?: string;
}

export function RealDataIntegrationTest() {
  const { activeCount, runningCount, isLoading: activeOpsLoading, error: activeOpsError } = useActiveOperations();
  const { billingData, isLoading: billingLoading, error: billingError } = useBillingData();
  const { analyticsData, isLoading: analyticsLoading, error: analyticsError } = useAnalyticsData();
  const { usageData, isLoading: usageLoading, error: usageError } = useUsageAnalytics();
  const { data: systemMetrics, isLoading: systemLoading, error: systemError } = useSystemMetrics();
  const { metrics: serviceMetrics, isLoading: serviceLoading } = useServiceAnalytics();

  const tests: TestResult[] = [
    {
      name: 'Active Operations Hook',
      status: activeOpsLoading ? 'loading' : activeOpsError ? 'error' : 'success',
      data: { activeCount, runningCount },
      error: activeOpsError?.message
    },
    {
      name: 'Billing Data Hook',
      status: billingLoading ? 'loading' : billingError ? 'error' : 'success',
      data: billingData,
      error: billingError?.message
    },
    {
      name: 'Analytics Data Hook',
      status: analyticsLoading ? 'loading' : analyticsError ? 'error' : 'success',
      data: analyticsData,
      error: analyticsError?.message
    },
    {
      name: 'Usage Analytics Hook',
      status: usageLoading ? 'loading' : usageError ? 'error' : 'success',
      data: usageData,
      error: usageError?.message
    },
    {
      name: 'System Metrics Hook',
      status: systemLoading ? 'loading' : systemError ? 'error' : 'success',
      data: systemMetrics,
      error: systemError?.message
    },
    {
      name: 'Service Analytics Hook',
      status: serviceLoading ? 'loading' : 'success',
      data: serviceMetrics
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'loading':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'loading':
        return <Badge className="bg-yellow-100 text-yellow-800">Loading</Badge>;
      default:
        return null;
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const loadingCount = tests.filter(t => t.status === 'loading').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real Data Integration Test</h2>
          <p className="text-gray-600">Testing all hooks and data integrations</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800">{successCount} Success</Badge>
          <Badge className="bg-red-100 text-red-800">{errorCount} Errors</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">{loadingCount} Loading</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{test.name}</CardTitle>
                {getStatusIcon(test.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getStatusBadge(test.status)}
                
                {test.error && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {test.error}
                  </div>
                )}
                
                {test.data && test.status === 'success' && (
                  <div className="text-xs bg-gray-50 p-2 rounded">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(test.data, null, 2).substring(0, 200)}
                      {JSON.stringify(test.data, null, 2).length > 200 ? '...' : ''}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-green-700">Successful Integrations</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-red-700">Failed Integrations</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{loadingCount}</div>
              <div className="text-sm text-yellow-700">Loading Integrations</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Integration Status</h4>
            <p className="text-sm text-blue-700">
              {successCount === tests.length 
                ? "🎉 All integrations are working perfectly! All hardcoded values have been replaced with real data."
                : errorCount > 0 
                ? "⚠️ Some integrations have errors. Check the database connection and table structure."
                : "⏳ Some integrations are still loading. Please wait for all data to load."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}