
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Users, 
  CreditCard, 
  Bell,
  Copy,
  Play
} from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: number;
  usageCount: number;
  tags: string[];
  icon: React.ReactNode;
}

export function WorkflowTemplates() {
  const templates: WorkflowTemplate[] = [
    {
      id: '1',
      name: 'User Onboarding Flow',
      description: 'Complete onboarding process for new users including service activation and welcome messages',
      category: 'User Management',
      steps: 5,
      usageCount: 23,
      tags: ['onboarding', 'welcome', 'activation'],
      icon: <Users className="w-5 h-5 text-blue-500" />
    },
    {
      id: '2',
      name: 'Payment Failure Recovery',
      description: 'Automated workflow for handling payment failures with retry logic and notifications',
      category: 'Billing',
      steps: 7,
      usageCount: 12,
      tags: ['payment', 'retry', 'notification'],
      icon: <CreditCard className="w-5 h-5 text-red-500" />
    },
    {
      id: '3',
      name: 'Service Usage Monitoring',
      description: 'Monitor service usage and send alerts when quotas are reached',
      category: 'Monitoring',
      steps: 4,
      usageCount: 35,
      tags: ['monitoring', 'quota', 'alerts'],
      icon: <Zap className="w-5 h-5 text-yellow-500" />
    },
    {
      id: '4',
      name: 'Bulk Service Activation',
      description: 'Activate multiple services for selected users based on criteria',
      category: 'Service Management',
      steps: 3,
      usageCount: 8,
      tags: ['bulk', 'activation', 'automation'],
      icon: <Bell className="w-5 h-5 text-green-500" />
    }
  ];

  const handleUseTemplate = (templateId: string) => {
    console.log('Using template:', templateId);
  };

  const handleCopyTemplate = (templateId: string) => {
    console.log('Copying template:', templateId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Templates</h3>
          <p className="text-gray-600">Pre-built workflows to get you started quickly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {template.icon}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">{template.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{template.steps} steps</span>
                <span>•</span>
                <span>Used {template.usageCount} times</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleUseTemplate(template.id)}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Use Template
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleCopyTemplate(template.id)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
