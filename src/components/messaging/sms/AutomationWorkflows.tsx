
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Zap, Play, Pause, Trash2, Plus } from 'lucide-react';
import { useWorkflows } from '@/hooks/useWorkflows';
import { toast } from 'sonner';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config: any;
  actions: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function AutomationWorkflows() {
  const { workflows, isLoading, createWorkflow, updateWorkflow, deleteWorkflow } = useWorkflows();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    triggerType: 'user_signup',
    message: '',
    delay: 0
  });

  // Type guard to ensure workflows is properly typed
  const typedWorkflows: Workflow[] = (workflows || []).map(w => ({
    id: w.id,
    name: w.name,
    description: w.description,
    trigger_type: w.trigger_type,
    trigger_config: w.trigger_config,
    actions: Array.isArray(w.actions) ? w.actions : [],
    is_active: w.is_active,
    created_at: w.created_at,
    updated_at: w.updated_at,
    user_id: w.user_id
  }));

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name || !newWorkflow.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createWorkflow({
        name: newWorkflow.name,
        description: newWorkflow.description,
        trigger_type: newWorkflow.triggerType,
        trigger_config: {
          delay: newWorkflow.delay
        },
        actions: [
          {
            type: 'send_sms',
            config: {
              message: newWorkflow.message,
              senderId: 'MOBIWAVE'
            }
          }
        ],
        is_active: true
      });

      setNewWorkflow({
        name: '',
        description: '',
        triggerType: 'user_signup',
        message: '',
        delay: 0
      });
      setShowCreateForm(false);
    } catch (error: any) {
      toast.error(`Failed to create workflow: ${error.message}`);
    }
  };

  const toggleWorkflow = async (workflow: Workflow) => {
    try {
      await updateWorkflow.mutateAsync({
        id: workflow.id,
        updates: { is_active: !workflow.is_active }
      });
    } catch (error: any) {
      toast.error(`Failed to toggle workflow: ${error.message}`);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      try {
        await deleteWorkflow.mutateAsync(workflowId);
      } catch (error: any) {
        toast.error(`Failed to delete workflow: ${error.message}`);
      }
    }
  };

  const getTriggerLabel = (triggerType: string) => {
    const labels = {
      user_signup: 'New User Signup',
      user_login: 'User Login',
      purchase_completed: 'Purchase Completed',
      subscription_expired: 'Subscription Expired',
      custom_event: 'Custom Event'
    };
    return labels[triggerType as keyof typeof labels] || triggerType;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SMS Automation Workflows</h2>
          <p className="text-gray-600">Create automated SMS campaigns triggered by events</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Workflow</CardTitle>
            <CardDescription>
              Set up an automated SMS campaign that triggers on specific events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="workflowName">Workflow Name *</Label>
              <Input
                id="workflowName"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name"
              />
            </div>

            <div>
              <Label htmlFor="workflowDescription">Description</Label>
              <Input
                id="workflowDescription"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <div>
              <Label htmlFor="triggerType">Trigger Event</Label>
              <Select
                value={newWorkflow.triggerType}
                onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, triggerType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user_signup">New User Signup</SelectItem>
                  <SelectItem value="user_login">User Login</SelectItem>
                  <SelectItem value="purchase_completed">Purchase Completed</SelectItem>
                  <SelectItem value="subscription_expired">Subscription Expired</SelectItem>
                  <SelectItem value="custom_event">Custom Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="delay">Delay (minutes)</Label>
              <Input
                id="delay"
                type="number"
                min="0"
                value={newWorkflow.delay}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, delay: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                How long to wait after the trigger event before sending SMS
              </p>
            </div>

            <div>
              <Label htmlFor="message">SMS Message *</Label>
              <Textarea
                id="message"
                value={newWorkflow.message}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter the SMS message to send..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Workflows</CardTitle>
          <CardDescription>
            Manage your automated SMS workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          {typedWorkflows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typedWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        {workflow.description && (
                          <div className="text-sm text-gray-500">{workflow.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTriggerLabel(workflow.trigger_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                        {workflow.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(workflow.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleWorkflow(workflow)}
                        >
                          {workflow.is_active ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No workflows created yet</p>
              <p className="text-sm text-gray-400">Create your first automated SMS workflow</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
