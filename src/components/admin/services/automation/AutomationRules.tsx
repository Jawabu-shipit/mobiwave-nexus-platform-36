
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Zap, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: string;
    conditions: any[];
  };
  actions: {
    type: string;
    config: any;
  }[];
  isActive: boolean;
  executionCount: number;
  lastExecuted?: Date;
  errorCount: number;
}

export function AutomationRules() {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Auto-activate SMS for new users',
      description: 'Automatically activate SMS service when a new user registers',
      trigger: {
        type: 'user_created',
        conditions: [{ field: 'user_type', operator: 'equals', value: 'standard' }]
      },
      actions: [
        { type: 'activate_service', config: { service_type: 'sms' } },
        { type: 'send_notification', config: { template: 'welcome_sms' } }
      ],
      isActive: true,
      executionCount: 45,
      lastExecuted: new Date('2024-06-14T10:30:00'),
      errorCount: 2
    },
    {
      id: '2',
      name: 'Low credits alert',
      description: 'Send notification when user credits drop below threshold',
      trigger: {
        type: 'credits_changed',
        conditions: [{ field: 'credits_remaining', operator: 'less_than', value: 10 }]
      },
      actions: [
        { type: 'send_notification', config: { template: 'low_credits_warning' } },
        { type: 'create_ticket', config: { priority: 'medium' } }
      ],
      isActive: true,
      executionCount: 28,
      lastExecuted: new Date('2024-06-14T09:15:00'),
      errorCount: 0
    },
    {
      id: '3',
      name: 'Payment failure handling',
      description: 'Deactivate premium services after payment failure',
      trigger: {
        type: 'payment_failed',
        conditions: [{ field: 'retry_count', operator: 'greater_than', value: 2 }]
      },
      actions: [
        { type: 'deactivate_premium_services', config: {} },
        { type: 'send_notification', config: { template: 'payment_failure_notice' } }
      ],
      isActive: false,
      executionCount: 5,
      lastExecuted: new Date('2024-06-13T16:45:00'),
      errorCount: 1
    }
  ]);

  const toggleRule = (ruleId: string) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: !rule.isActive }
          : rule
      )
    );
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600' : 'text-gray-400';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />;
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'user_created':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'credits_changed':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'payment_failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Zap className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Automation Rules</h3>
          <p className="text-gray-600">Create and manage automated service workflows</p>
        </div>
        <Button>Create New Rule</Button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={getStatusColor(rule.isActive)}>
                    {getStatusIcon(rule.isActive)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                  <Button size="sm" variant="ghost">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => deleteRule(rule.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Trigger */}
              <div className="flex items-center gap-2">
                {getTriggerIcon(rule.trigger.type)}
                <span className="font-medium">Trigger:</span>
                <Badge variant="outline">{rule.trigger.type}</Badge>
                {rule.trigger.conditions.length > 0 && (
                  <span className="text-sm text-gray-600">
                    with {rule.trigger.conditions.length} condition(s)
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Actions:</span>
                </div>
                <div className="flex flex-wrap gap-2 ml-6">
                  {rule.actions.map((action, index) => (
                    <Badge key={index} variant="secondary">
                      {action.type.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600 pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  <span>Executed: {rule.executionCount}</span>
                </div>
                {rule.errorCount > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Errors: {rule.errorCount}</span>
                  </div>
                )}
                {rule.lastExecuted && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Last: {rule.lastExecuted.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
