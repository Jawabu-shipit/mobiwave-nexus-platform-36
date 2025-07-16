
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWhatsAppTemplatesData } from '@/hooks/whatsapp/useWhatsAppTemplatesData';
import { useWhatsAppTemplateMutations } from '@/hooks/whatsapp/useWhatsAppTemplateMutations';
import { TemplateForm } from './template-manager/TemplateForm';
import { TemplateTable } from './template-manager/TemplateTable';
import { EmptyTemplateState } from './template-manager/EmptyTemplateState';
import { FileText, Plus } from 'lucide-react';

interface WhatsAppTemplateManagerProps {
  subscriptionId: string;
}

export function WhatsAppTemplateManager({ subscriptionId }: WhatsAppTemplateManagerProps) {
  const { data: templates = [], isLoading } = useWhatsAppTemplatesData(subscriptionId);
  const { createTemplate, isCreating } = useWhatsAppTemplateMutations(subscriptionId);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'marketing',
    language: 'en',
    header_text: '',
    body_text: '',
    footer_text: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createTemplate(formData);
      setFormData({
        name: '',
        category: 'marketing',
        language: 'en',
        header_text: '',
        body_text: '',
        footer_text: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Message Templates
          </h3>
          <p className="text-sm text-gray-600">
            Create and manage WhatsApp message templates for your campaigns.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {showForm && (
        <TemplateForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          isCreating={isCreating}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <EmptyTemplateState onCreateTemplate={() => setShowForm(true)} />
          ) : (
            <TemplateTable templates={templates} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
