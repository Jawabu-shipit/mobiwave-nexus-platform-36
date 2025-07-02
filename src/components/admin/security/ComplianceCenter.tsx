
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileCheck,
  Download,
  Calendar,
  Lock,
  Eye,
  Settings
} from 'lucide-react';

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  compliance_score: number;
  total_controls: number;
  implemented_controls: number;
  status: 'compliant' | 'partial' | 'non_compliant';
  last_assessment: string;
  next_review: string;
}

export function ComplianceCenter() {
  const [frameworks] = useState<ComplianceFramework[]>([
    {
      id: '1',
      name: 'GDPR',
      description: 'General Data Protection Regulation',
      compliance_score: 85,
      total_controls: 24,
      implemented_controls: 20,
      status: 'partial',
      last_assessment: '2024-06-01',
      next_review: '2024-09-01'
    },
    {
      id: '2',
      name: 'ISO 27001',
      description: 'Information Security Management',
      compliance_score: 92,
      total_controls: 114,
      implemented_controls: 105,
      status: 'compliant',
      last_assessment: '2024-05-15',
      next_review: '2024-11-15'
    },
    {
      id: '3',
      name: 'SOC 2',
      description: 'Service Organization Control 2',
      compliance_score: 78,
      total_controls: 42,
      implemented_controls: 33,
      status: 'partial',
      last_assessment: '2024-04-20',
      next_review: '2024-10-20'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'partial':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'non_compliant':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const overallScore = Math.round(
    frameworks.reduce((sum, f) => sum + f.compliance_score, 0) / frameworks.length
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Compliance Center
          </h3>
          <p className="text-gray-600">Monitor and manage compliance across frameworks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <FileCheck className="w-4 h-4 mr-2" />
            Run Assessment
          </Button>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">Overall Compliance Score</h4>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {overallScore}%
            </Badge>
          </div>
          <Progress value={overallScore} className="h-3 mb-2" />
          <p className="text-sm text-gray-600">
            Average across {frameworks.length} compliance frameworks
          </p>
        </CardContent>
      </Card>

      {/* Framework Details */}
      <div className="grid gap-4">
        {frameworks.map((framework) => (
          <Card key={framework.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(framework.status)}
                  <div>
                    <CardTitle className="text-lg">{framework.name}</CardTitle>
                    <p className="text-sm text-gray-600">{framework.description}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(framework.status)}>
                  {framework.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Compliance Score</span>
                <span className="font-semibold">{framework.compliance_score}%</span>
              </div>
              <Progress value={framework.compliance_score} className="h-2" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Controls Implemented</span>
                  <div className="font-medium">
                    {framework.implemented_controls}/{framework.total_controls}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Last Assessment</span>
                  <div className="font-medium">{framework.last_assessment}</div>
                </div>
                <div>
                  <span className="text-gray-500">Next Review</span>
                  <div className="font-medium">{framework.next_review}</div>
                </div>
                <div>
                  <span className="text-gray-500">Gap Analysis</span>
                  <div className="font-medium">
                    {framework.total_controls - framework.implemented_controls} gaps
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="w-3 h-3 mr-1" />
                  Schedule Review
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Lock className="w-6 h-6 mb-2" />
              <span className="text-sm">Data Mapping</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileCheck className="w-6 h-6 mb-2" />
              <span className="text-sm">Risk Assessment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Shield className="w-6 h-6 mb-2" />
              <span className="text-sm">Policy Review</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Download className="w-6 h-6 mb-2" />
              <span className="text-sm">Audit Trail</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
