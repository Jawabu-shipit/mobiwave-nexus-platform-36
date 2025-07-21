import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Edit, 
  Copy, 
  Trash2,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { useServiceTemplates } from '@/hooks/useServiceTemplates';
import { TemplateCard } from '../services/templates/TemplateCard';
import { TemplateCreateForm } from '../services/templates/TemplateCreateForm';

// Updated interface to match database schema
interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  service_type: string;
  template_config: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export function ServiceTemplateManager() {
  const { 
    templates, 
    isCreating, 
    setIsCreating, 
    createTemplate, 
    deleteTemplate, 
    duplicateTemplate 
  } = useServiceTemplates();

  const [editingTemplate, setEditingTemplate] = useState<ServiceTemplate | null>(null);

  const serviceTypes = ['ussd', 'sms', 'mpesa', 'whatsapp', 'survey'];

  const handleEdit = (template: ServiceTemplate) => {
    setEditingTemplate(template);
  };

  const handleDelete = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      await deleteTemplate(template);
    }
  };

  const handleDuplicate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      await duplicateTemplate(template);
    }
  };

  const handleCreateTemplate = async (templateData: any): Promise<void> => {
    const success = await createTemplate(templateData);
    if (success) {
      setIsCreating(false);
    }
  };

  const exportTemplates = () => {
    const dataStr = JSON.stringify(templates, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'service-templates.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Service Templates
          </h3>
          <p className="text-gray-600">Manage reusable service configurations and templates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportTemplates}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="flex flex-col items-center justify-center h-48 text-center">
            <Plus className="w-8 h-8 text-gray-400 mb-2" />
            <h4 className="font-medium text-gray-600">Create New Template</h4>
            <p className="text-sm text-gray-500 mb-4">Build a reusable service configuration</p>
            <Button onClick={() => setIsCreating(true)}>Get Started</Button>
          </CardContent>
        </Card>

        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={handleEdit}
            onDuplicate={() => handleDuplicate(template.id)}
            onDelete={() => handleDelete(template.id)}
          />
        ))}
      </div>

      {isCreating && (
        <TemplateCreateForm
          serviceTypes={serviceTypes}
          onSubmit={handleCreateTemplate}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {editingTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Template: {editingTemplate.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Template editing functionality coming soon...</p>
            <Button 
              variant="outline" 
              onClick={() => setEditingTemplate(null)}
              className="mt-4"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Template Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{templates.length}</div>
              <div className="text-sm text-gray-600">Total Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {templates.filter(t => t.is_default).length}
              </div>
              <div className="text-sm text-gray-600">Default Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Set(templates.map(t => t.service_type)).size}
              </div>
              <div className="text-sm text-gray-600">Service Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {templates.filter(t => !t.is_default).length}
              </div>
              <div className="text-sm text-gray-600">Custom Templates</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
