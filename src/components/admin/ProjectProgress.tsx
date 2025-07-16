
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, Target } from 'lucide-react';

interface Feature {
  name: string;
  status: 'completed' | 'in-progress' | 'pending' | 'testing';
  progress: number;
  priority: 'high' | 'medium' | 'low';
}

interface Phase {
  name: string;
  description: string;
  progress: number;
  features: Feature[];
  status: 'completed' | 'in-progress' | 'pending';
}

export function ProjectProgress() {
  const phases: Phase[] = [
    {
      name: 'Phase 1: Core Platform',
      description: 'Basic SMS campaigns, user management, admin dashboard',
      progress: 95,
      status: 'completed',
      features: [
        { name: 'SMS Campaign Manager', status: 'completed', progress: 100, priority: 'high' },
        { name: 'User Authentication', status: 'completed', progress: 100, priority: 'high' },
        { name: 'Admin Dashboard', status: 'completed', progress: 100, priority: 'high' },
        { name: 'M-Pesa Integration', status: 'completed', progress: 100, priority: 'high' },
        { name: 'Mspace API Integration', status: 'completed', progress: 95, priority: 'high' }
      ]
    },
    {
      name: 'Phase 2: Dashboard Features',
      description: 'Enhanced billing, profile management, analytics',
      progress: 85,
      status: 'completed',
      features: [
        { name: 'Credit Purchase History', status: 'completed', progress: 100, priority: 'medium' },
        { name: 'Profile Management', status: 'completed', progress: 100, priority: 'medium' },
        { name: 'API Key Management', status: 'completed', progress: 100, priority: 'medium' },
        { name: 'Campaign Analytics', status: 'completed', progress: 90, priority: 'high' },
        { name: 'Real-time Metrics', status: 'completed', progress: 80, priority: 'medium' }
      ]
    },
    {
      name: 'Phase 3: Additional Services',
      description: 'Email campaigns, WhatsApp, surveys and forms',
      progress: 80,
      status: 'completed',
      features: [
        { name: 'Email Campaign System', status: 'completed', progress: 85, priority: 'high' },
        { name: 'WhatsApp Business Integration', status: 'completed', progress: 75, priority: 'high' },
        { name: 'Survey & Forms Builder', status: 'completed', progress: 80, priority: 'medium' },
        { name: 'Template Management', status: 'completed', progress: 90, priority: 'medium' }
      ]
    },
    {
      name: 'Phase 4: Advanced Admin Tools',
      description: 'Enhanced monitoring, security, database administration',
      progress: 70,
      status: 'in-progress',
      features: [
        { name: 'System Health Dashboard', status: 'completed', progress: 85, priority: 'high' },
        { name: 'Two-Factor Authentication', status: 'completed', progress: 80, priority: 'high' },
        { name: 'Enhanced Security Monitor', status: 'in-progress', progress: 60, priority: 'high' },
        { name: 'Database Administration', status: 'in-progress', progress: 40, priority: 'medium' },
        { name: 'Audit Trail System', status: 'in-progress', progress: 55, priority: 'medium' }
      ]
    },
    {
      name: 'Phase 5: Security & Production',
      description: 'RLS policies, edge functions, production deployment',
      progress: 25,
      status: 'pending',
      features: [
        { name: 'Row Level Security Policies', status: 'pending', progress: 20, priority: 'high' },
        { name: 'Edge Functions Enhancement', status: 'pending', progress: 30, priority: 'high' },
        { name: 'Production Environment', status: 'pending', progress: 15, priority: 'high' },
        { name: 'SSL & Security Headers', status: 'pending', progress: 25, priority: 'high' },
        { name: 'Backup & Recovery', status: 'pending', progress: 10, priority: 'medium' }
      ]
    },
    {
      name: 'Phase 6: Testing & Optimization',
      description: 'Testing framework, mobile optimization, performance',
      progress: 10,
      status: 'pending',
      features: [
        { name: 'Unit Testing Framework', status: 'pending', progress: 0, priority: 'high' },
        { name: 'Integration Testing', status: 'pending', progress: 0, priority: 'high' },
        { name: 'Mobile Responsiveness', status: 'pending', progress: 15, priority: 'medium' },
        { name: 'Performance Optimization', status: 'pending', progress: 20, priority: 'medium' },
        { name: 'Load Testing', status: 'pending', progress: 0, priority: 'medium' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'testing': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const overallProgress = Math.round(
    phases.reduce((sum, phase) => sum + phase.progress, 0) / phases.length
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 bg-clip-text text-transparent">
          Project Development Progress
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Comprehensive overview of development phases, features, and completion status.
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-indigo-600 mb-4">{overallProgress}%</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Overall Project Completion</h3>
            <Progress value={overallProgress} className="w-full max-w-md mx-auto mb-4" />
            <p className="text-gray-600">
              Ready for MVP launch • {phases.filter(p => p.status === 'completed').length} of {phases.length} phases completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Phase Breakdown */}
      <div className="space-y-6">
        {phases.map((phase, index) => (
          <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    {getStatusIcon(phase.status)}
                    {phase.name}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {phase.description}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(phase.status)}>
                    {phase.status.replace('-', ' ')}
                  </Badge>
                  <div className="text-2xl font-bold text-gray-900 mt-2">
                    {phase.progress}%
                  </div>
                </div>
              </div>
              <Progress value={phase.progress} className="mt-4" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {phase.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{feature.name}</h4>
                      <Badge className={`${getPriorityColor(feature.priority)} text-xs`}>
                        {feature.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(feature.status)}
                      <Badge className={`${getStatusColor(feature.status)} text-xs`}>
                        {feature.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <Progress value={feature.progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">{feature.progress}% complete</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Steps */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-green-900">Next Steps for MVP Launch</CardTitle>
          <CardDescription className="text-green-700">
            Immediate priorities to complete the minimum viable product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-green-900">Critical (Complete by Week 1)</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Implement comprehensive RLS policies
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Enhance edge function error handling
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Complete security monitoring
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-green-900">Important (Complete by Week 2)</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Set up production environment
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Implement basic testing framework
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Optimize mobile responsiveness
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
