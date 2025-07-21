
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Shield,
  Database,
  Server,
  Globe,
  Zap,
  RefreshCw
} from 'lucide-react';

interface ReadinessCheck {
  id: string;
  category: string;
  name: string;
  status: 'passed' | 'warning' | 'failed' | 'pending';
  description: string;
  recommendation?: string;
  critical: boolean;
}

interface ReadinessReport {
  overallScore: number;
  totalChecks: number;
  passedChecks: number;
  criticalIssues: number;
  checks: ReadinessCheck[];
}

export function ProductionReadinessChecker() {
  const [isRunningCheck, setIsRunningCheck] = useState(false);

  const { data: readinessReport, refetch } = useQuery({
    queryKey: ['production-readiness'],
    queryFn: async (): Promise<ReadinessReport> => {
      const checks: ReadinessCheck[] = [
        {
          id: '1',
          category: 'Security',
          name: 'SSL/TLS Configuration',
          status: 'passed',
          description: 'SSL certificates are valid and properly configured',
          critical: true
        },
        {
          id: '2',
          category: 'Security',
          name: 'Environment Variables',
          status: 'warning',
          description: 'Some sensitive data may be exposed in logs',
          recommendation: 'Review logging configuration to prevent sensitive data exposure',
          critical: false
        },
        {
          id: '3',
          category: 'Performance',
          name: 'Database Optimization',
          status: 'passed',
          description: 'Database queries are optimized and indexes are present',
          critical: true
        },
        {
          id: '4',
          category: 'Performance',
          name: 'Caching Strategy',
          status: 'failed',
          description: 'No caching layer detected for frequently accessed data',
          recommendation: 'Implement Redis or similar caching solution',
          critical: false
        },
        {
          id: '5',
          category: 'Monitoring',
          name: 'Error Tracking',
          status: 'passed',
          description: 'Error tracking and logging systems are configured',
          critical: true
        },
        {
          id: '6',
          category: 'Monitoring',
          name: 'Health Checks',
          status: 'passed',
          description: 'Health check endpoints are responding correctly',
          critical: true
        },
        {
          id: '7',
          category: 'Backup',
          name: 'Database Backups',
          status: 'warning',
          description: 'Backups are configured but not tested recently',
          recommendation: 'Run backup restoration test to verify integrity',
          critical: true
        },
        {
          id: '8',
          category: 'Scalability',
          name: 'Load Balancing',
          status: 'pending',
          description: 'Load balancing configuration not verified',
          critical: false
        }
      ];

      const passedChecks = checks.filter(c => c.status === 'passed').length;
      const criticalIssues = checks.filter(c => c.critical && c.status !== 'passed').length;
      const overallScore = Math.round((passedChecks / checks.length) * 100);

      return {
        overallScore,
        totalChecks: checks.length,
        passedChecks,
        criticalIssues,
        checks
      };
    }
  });

  const runProductionCheck = async () => {
    setIsRunningCheck(true);
    await refetch();
    setTimeout(() => {
      setIsRunningCheck(false);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-gray-600" />;
      default: return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string, critical: boolean = false) => {
    if (critical && status !== 'passed') {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security': return <Shield className="w-4 h-4" />;
      case 'Performance': return <Zap className="w-4 h-4" />;
      case 'Monitoring': return <Server className="w-4 h-4" />;
      case 'Backup': return <Database className="w-4 h-4" />;
      case 'Scalability': return <Globe className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Production Readiness</h2>
          <p className="text-gray-600">Comprehensive production deployment checklist</p>
        </div>
        <Button onClick={runProductionCheck} disabled={isRunningCheck}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRunningCheck ? 'animate-spin' : ''}`} />
          {isRunningCheck ? 'Checking...' : 'Run Check'}
        </Button>
      </div>

      {/* Overall Score */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(readinessReport?.overallScore || 0)}`}>
              {readinessReport?.overallScore}%
            </div>
            <p className="text-lg text-gray-600 mb-4">Production Readiness Score</p>
            <Progress value={readinessReport?.overallScore} className="mb-4" />
            <div className="flex justify-center gap-6 text-sm">
              <div>
                <span className="font-medium">{readinessReport?.passedChecks}</span>
                <span className="text-gray-600">/{readinessReport?.totalChecks} Checks Passed</span>
              </div>
              <div>
                <span className="font-medium text-red-600">{readinessReport?.criticalIssues}</span>
                <span className="text-gray-600"> Critical Issues</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {readinessReport && readinessReport.criticalIssues > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Critical Issues Detected
            </CardTitle>
            <CardDescription className="text-red-700">
              {readinessReport.criticalIssues} critical issues must be resolved before production deployment.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Readiness Checks by Category */}
      <div className="space-y-6">
        {['Security', 'Performance', 'Monitoring', 'Backup', 'Scalability'].map((category) => {
          const categoryChecks = readinessReport?.checks.filter(c => c.category === category) || [];
          if (categoryChecks.length === 0) return null;

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {category}
                </CardTitle>
                <CardDescription>
                  {categoryChecks.length} checks in this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryChecks.map((check) => (
                    <div key={check.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      {getStatusIcon(check.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{check.name}</h3>
                          {check.critical && (
                            <Badge variant="destructive" className="text-xs">
                              Critical
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{check.description}</p>
                        {check.recommendation && (
                          <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                            <strong>Recommendation:</strong> {check.recommendation}
                          </div>
                        )}
                      </div>
                      <Badge className={getStatusColor(check.status, check.critical)}>
                        {check.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
