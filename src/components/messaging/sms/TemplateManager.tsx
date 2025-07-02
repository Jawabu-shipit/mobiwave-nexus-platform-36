
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { FileText, Plus, Edit, Trash2, Save } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  created_at: string;
}

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Welcome Message',
      content: 'Welcome {{name}}! Thank you for joining {{company}}. Your account is now active.',
      category: 'welcome',
      variables: ['name', 'company'],
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Payment Reminder',
      content: 'Hi {{name}}, your payment of {{amount}} is due on {{date}}. Please pay to avoid late fees.',
      category: 'billing',
      variables: ['name', 'amount', 'date'],
      created_at: new Date().toISOString()
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: ''
  });

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([^}]+)\}\}/g);
    return matches ? matches.map(match => match.slice(2, -2)) : [];
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    const variables = extractVariables(newTemplate.content);
    const template: Template = {
      id: Date.now().toString(),
      name: newTemplate.name,
      content: newTemplate.content,
      category: newTemplate.category || 'general',
      variables,
      created_at: new Date().toISOString()
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({ name: '', content: '', category: '' });
    setIsCreating(false);
    toast.success('Template saved successfully');
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;

    const variables = extractVariables(editingTemplate.content);
    const updatedTemplate = {
      ...editingTemplate,
      variables
    };

    setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
    setEditingTemplate(null);
    toast.success('Template updated successfully');
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success('Template deleted successfully');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'welcome': return 'bg-green-100 text-green-800';
      case 'billing': return 'bg-blue-100 text-blue-800';
      case 'marketing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Message Templates</h3>
          <p className="text-sm text-gray-600">Create and manage reusable message templates</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
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
                  value={editingTemplate ? editingTemplate.name : newTemplate.name}
                  onChange={(e) => {
                    if (editingTemplate) {
                      setEditingTemplate({ ...editingTemplate, name: e.target.value });
                    } else {
                      setNewTemplate(prev => ({ ...prev, name: e.target.value }));
                    }
                  }}
                  placeholder="Enter template name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateCategory">Category</Label>
                <Input
                  id="templateCategory"
                  value={editingTemplate ? editingTemplate.category : newTemplate.category}
                  onChange={(e) => {
                    if (editingTemplate) {
                      setEditingTemplate({ ...editingTemplate, category: e.target.value });
                    } else {
                      setNewTemplate(prev => ({ ...prev, category: e.target.value }));
                    }
                  }}
                  placeholder="e.g., welcome, billing, marketing"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateContent">Message Content</Label>
              <Textarea
                id="templateContent"
                value={editingTemplate ? editingTemplate.content : newTemplate.content}
                onChange={(e) => {
                  if (editingTemplate) {
                    setEditingTemplate({ ...editingTemplate, content: e.target.value });
                  } else {
                    setNewTemplate(prev => ({ ...prev, content: e.target.value }));
                  }
                }}
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
              >
                <Save className="w-4 h-4" />
                {editingTemplate ? 'Update Template' : 'Save Template'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setEditingTemplate(null);
                  setNewTemplate({ name: '', content: '', category: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
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
                    onClick={() => setEditingTemplate(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
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
