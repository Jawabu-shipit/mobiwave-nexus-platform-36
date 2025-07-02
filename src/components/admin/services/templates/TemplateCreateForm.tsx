import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface TemplateCreateFormProps {
  serviceTypes: string[];
  onSubmit: (templateData: any) => Promise<void>;
  onCancel: () => void;
}

export function TemplateCreateForm({ serviceTypes, onSubmit, onCancel }: TemplateCreateFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    service_type: '',
    description: '',
    is_default: false,
    template_config: {}
  });

  const [configString, setConfigString] = useState('{}');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfigurationChange = (value: string) => {
    setConfigString(value);
    try {
      const parsed = JSON.parse(value);
      setFormData(prev => ({ ...prev, template_config: parsed }));
    } catch {
      // Invalid JSON, keep the string but don't update config
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.service_type) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        service_type: '',
        description: '',
        is_default: false,
        template_config: {}
      });
      setConfigString('{}');
    } catch (error) {
      console.error('Failed to create template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Template</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="Enter template name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-type">Service Type</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              placeholder="Describe this template..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is-default"
              checked={formData.is_default}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
            />
            <Label htmlFor="is-default">Set as default template</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-config">Configuration (JSON)</Label>
            <Textarea
              id="template-config"
              placeholder="Enter template configuration as JSON..."
              value={configString}
              onChange={(e) => handleConfigurationChange(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Enter the template configuration as valid JSON. Example: {"{"}"monthly_fee": 5000, "setup_fee": 2000{"}"}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Template'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
