
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TemplateFormData {
  name: string;
  category: string;
  language: string;
  header_text: string;
  body_text: string;
  footer_text: string;
}

interface TemplateFormProps {
  formData: TemplateFormData;
  setFormData: React.Dispatch<React.SetStateAction<TemplateFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isCreating: boolean;
}

export function TemplateForm({ formData, setFormData, onSubmit, onCancel, isCreating }: TemplateFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Template</CardTitle>
        <CardDescription>
          Design a message template that will be submitted to WhatsApp for approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="my_template_name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="header_text">Header Text (Optional)</Label>
            <Input
              id="header_text"
              value={formData.header_text}
              onChange={(e) => setFormData(prev => ({ ...prev, header_text: e.target.value }))}
              placeholder="Welcome to our service!"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body_text">Body Text</Label>
            <Textarea
              id="body_text"
              value={formData.body_text}
              onChange={(e) => setFormData(prev => ({ ...prev, body_text: e.target.value }))}
              placeholder="Hello {`{1}`}, your order {`{2}`} has been confirmed."
              className="min-h-[100px]"
              required
            />
            <p className="text-xs text-gray-500">
              Use {`{1}`}, {`{2}`}, etc. for dynamic variables
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_text">Footer Text (Optional)</Label>
            <Input
              id="footer_text"
              value={formData.footer_text}
              onChange={(e) => setFormData(prev => ({ ...prev, footer_text: e.target.value }))}
              placeholder="Thank you for choosing us!"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Template'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
