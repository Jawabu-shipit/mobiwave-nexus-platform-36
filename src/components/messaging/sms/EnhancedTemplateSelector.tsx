import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Eye, Plus } from 'lucide-react';
import { useSMSTemplates } from '@/hooks/sms/useSMSTemplates';
import { toast } from 'sonner';

interface EnhancedTemplateSelectorProps {
  onTemplateSelect: (content: string, variables: Record<string, string>) => void;
  selectedTemplate?: string;
}

export function EnhancedTemplateSelector({ 
  onTemplateSelect, 
  selectedTemplate 
}: EnhancedTemplateSelectorProps) {
  const { templates, isLoading } = useSMSTemplates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const categories = Array.from(new Set(templates.map(t => t.category)));
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = (template: any) => {
    if (template.variables && template.variables.length > 0) {
      // If template has variables, show preview dialog
      setPreviewTemplate(template);
      // Initialize variable values
      const initialValues: Record<string, string> = {};
      template.variables.forEach((variable: string) => {
        initialValues[variable] = '';
      });
      setVariableValues(initialValues);
    } else {
      // If no variables, use template directly
      onTemplateSelect(template.content, {});
      toast.success('Template applied successfully');
    }
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const handleUseTemplate = () => {
    if (previewTemplate) {
      onTemplateSelect(previewTemplate.content, variableValues);
      setPreviewTemplate(null);
      setVariableValues({});
      toast.success('Template applied with variables');
    }
  };

  const replaceVariablesInContent = (content: string, variables: Record<string, string>) => {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(regex, value || `{{${key}}}`);
    });
    return result;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            SMS Templates
          </CardTitle>
          <CardDescription>
            Choose from pre-built templates to speed up your messaging
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Templates Grid */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading templates...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No templates found</p>
                <p className="text-sm">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {filteredTemplates.map(template => (
                  <div 
                    key={template.id} 
                    className={`border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer ${
                      selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {template.category}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Template Preview: {template.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                              <div>
                                <Label>Category</Label>
                                <p className="text-sm text-gray-600">{template.category}</p>
                              </div>
                              <div>
                                <Label>Content</Label>
                                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                  {template.content}
                                </div>
                              </div>
                              {template.variables && template.variables.length > 0 && (
                                <div>
                                  <Label>Variables</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {template.variables.map((variable: string, index: number) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {variable}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {template.content}
                    </p>
                    {template.variables && template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.variables.slice(0, 3).map((variable: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                        {template.variables.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.variables.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Variable Input Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Template Variables</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Template: {previewTemplate.name}</Label>
                <div className="bg-gray-50 p-3 rounded-lg text-sm mt-1">
                  {replaceVariablesInContent(previewTemplate.content, variableValues)}
                </div>
              </div>
              
              {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                <div className="space-y-3">
                  <Label>Fill in the variables:</Label>
                  {previewTemplate.variables.map((variable: string) => (
                    <div key={variable}>
                      <Label htmlFor={variable} className="text-sm font-medium">
                        {variable}
                      </Label>
                      <Input
                        id={variable}
                        value={variableValues[variable] || ''}
                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                        placeholder={`Enter value for ${variable}`}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUseTemplate}>
                  Use Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}