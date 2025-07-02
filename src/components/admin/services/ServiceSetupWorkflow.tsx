
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Play, Pause, MoreHorizontal } from 'lucide-react';

interface ServiceCatalog {
  id: string;
  service_name: string;
  service_type: string;
  description: string;
  setup_fee: number;
  monthly_fee: number;
  transaction_fee_type: string;
  transaction_fee_amount: number;
  is_premium: boolean;
  is_active: boolean;
  provider: string;
}

interface ServiceSetupWorkflowProps {
  services: ServiceCatalog[];
  activeWorkflow: string | null;
  onWorkflowComplete: () => void;
}

export function ServiceSetupWorkflow({ 
  services, 
  activeWorkflow, 
  onWorkflowComplete 
}: ServiceSetupWorkflowProps) {
  const workflows = [
    {
      id: '1',
      name: 'New User Onboarding',
      description: 'Complete setup workflow for new users including service activation',
      steps: ['Create Profile', 'Verify Email', 'Activate Basic Services', 'Send Welcome Message'],
      status: 'active',
      completedRuns: 1250,
      lastRun: '2024-01-15T14:30:00Z'
    },
    {
      id: '2',
      name: 'Service Migration',
      description: 'Migrate users from old service configuration to new one',
      steps: ['Backup Current Config', 'Apply New Configuration', 'Test Services', 'Notify Users'],
      status: 'draft',
      completedRuns: 0,
      lastRun: null
    },
    {
      id: '3',
      name: 'Bulk Service Activation',
      description: 'Activate multiple services for selected users in bulk',
      steps: ['Validate Users', 'Check Eligibility', 'Activate Services', 'Send Notifications'],
      status: 'paused',
      completedRuns: 45,
      lastRun: '2024-01-10T09:15:00Z'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Setup Workflows</h3>
          <p className="text-gray-600">
            Automated workflows for service setup and management tasks
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Create New Workflow
        </Button>
      </div>

      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(workflow.status)}>
                    {workflow.status}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Workflow Steps</h4>
                  <div className="flex flex-wrap gap-2">
                    {workflow.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                        {index < workflow.steps.length - 1 && (
                          <div className="w-4 h-0.5 bg-gray-300 ml-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Completed Runs:</span>
                    <span className="ml-2 font-medium">{workflow.completedRuns.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Run:</span>
                    <span className="ml-2 font-medium">
                      {workflow.lastRun 
                        ? new Date(workflow.lastRun).toLocaleString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    Run Now
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Pause className="w-3 h-3" />
                    {workflow.status === 'active' ? 'Pause' : 'Resume'}
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    View Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
