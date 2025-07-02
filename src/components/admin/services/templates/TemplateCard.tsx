
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Copy, Trash2, Clock } from 'lucide-react';

interface ServiceTemplate {
  id: string;
  name: string;
  service_type: string;
  description: string;
  template_config: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface TemplateCardProps {
  template: ServiceTemplate;
  onEdit: (template: ServiceTemplate) => void;
  onDuplicate: (template: ServiceTemplate) => void;
  onDelete: (templateId: string) => void;
}

export function TemplateCard({ template, onEdit, onDuplicate, onDelete }: TemplateCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'sms': return 'bg-blue-100 text-blue-800';
      case 'ussd': return 'bg-green-100 text-green-800';
      case 'mpesa': return 'bg-yellow-100 text-yellow-800';
      case 'whatsapp': return 'bg-emerald-100 text-emerald-800';
      case 'survey': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getServiceTypeColor(template.service_type)}>
                {template.service_type.toUpperCase()}
              </Badge>
              {template.is_default && (
                <Badge variant="secondary">Default</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {template.description}
        </p>
        
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
          <Clock className="w-3 h-3" />
          Created: {formatDate(template.created_at)}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(template)}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDuplicate(template)}
          >
            <Copy className="w-3 h-3" />
          </Button>
          {!template.is_default && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(template.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
