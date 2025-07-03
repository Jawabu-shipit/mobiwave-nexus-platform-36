import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState } from "@/components/common/LoadingState";
import { toast } from 'sonner';
import { FileText, Plus, Edit, Trash2, Save, Upload } from 'lucide-react';
import { useSMSTemplates, SMSTemplate } from '@/hooks/useSMSTemplates';

interface TemplateManagerProps {
  onTemplateSelect?: (template: SMSTemplate) => void;
  showTemplateSelector?: boolean;
  selectedTemplateId?: string;
}

export function TemplateManager({ onTemplateSelect, showTemplateSelector = false, selectedTemplateId }: TemplateManagerProps) {
  const { 
    templates, 
    isLoading, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate, 
    processTemplate,
    isCreating: isCreatingTemplate,
    isUpdating,
    isDeleting
  } = useSMSTemplates();

  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SMSTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'general'
  });

  const handleSaveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createTemplate(newTemplate);
      setNewTemplate({ name: '', content: '', category: 'general' });
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      await updateTemplate({
        id: editingTemplate.id,
        name: newTemplate.name,
        content: newTemplate.content,
        category: newTemplate.category,
      });
      setEditingTemplate(null);
      setNewTemplate({ name: '', content: '', category: 'general' });
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await deleteTemplate(id);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const startEditing = (template: SMSTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      content: template.content,
      category: template.category,
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'welcome': return 'bg-green-100 text-green-800';
      case 'billing': return 'bg-blue-100 text-blue-800';
      case 'marketing': return 'bg-purple-100 text-purple-800';
      case 'notification': return 'bg-yellow-100 text-yellow-800';
      case 'reminder': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading templates..." />;
  }

  return (
    <div className="space-y-6">
      {showTemplateSelector && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Use Template
            </CardTitle>
            <CardDescription>
              Select a template to quickly compose your message
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedTemplateId} onValueChange={(value) => {
              const template = templates.find(t => t.id === value);
              if (template && onTemplateSelect) {
                onTemplateSelect(template);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-gray-500">{template.category}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Message Templates</h3>
          <p className="text-sm text-gray-600">Create and manage reusable message templates</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)} 
          className="flex items-center gap-2"
          disabled={isCreating}
        >
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {(isCreating || editingTemplate) && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateCategory">Category</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="templateCategory">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateContent">Message Content</Label>
              <Textarea
                id="templateContent"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your message. Use {{variable}} for dynamic content."
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Use double curly braces for variables: {"{{name}}, {{amount}}, {{date}}"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={editingTemplate ? handleUpdateTemplate : handleSaveTemplate}
                className="flex items-center gap-2"
                disabled={isCreatingTemplate || isUpdating}
              >
                <Save className="w-4 h-4" />
                {editingTemplate ? 'Update Template' : 'Save Template'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setEditingTemplate(null);
                  setNewTemplate({ name: '', content: '', category: 'general' });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {templates.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Yet</h3>
              <p className="text-gray-500 mb-4">Create your first message template to get started</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge className={getCategoryColor(template.category)} variant="secondary">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.content}</p>
                    {template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500">Variables:</span>
                        {template.variables.map((variable, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(template)}
                      disabled={isUpdating}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}