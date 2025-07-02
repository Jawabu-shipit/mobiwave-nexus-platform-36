
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, User, Wand2, Code, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface PersonalizationField {
  key: string;
  label: string;
  defaultValue: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

interface MessagePersonalizerProps {
  message: string;
  onMessageChange: (message: string) => void;
  contacts?: any[];
}

export function MessagePersonalizer({ message, onMessageChange, contacts = [] }: MessagePersonalizerProps) {
  const [previewContact, setPreviewContact] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const personalizationFields: PersonalizationField[] = [
    { key: 'firstName', label: 'First Name', defaultValue: 'John', type: 'text' },
    { key: 'lastName', label: 'Last Name', defaultValue: 'Doe', type: 'text' },
    { key: 'company', label: 'Company', defaultValue: 'Acme Corp', type: 'text' },
    { key: 'phone', label: 'Phone', defaultValue: '+254712345678', type: 'text' },
    { key: 'email', label: 'Email', defaultValue: 'john@example.com', type: 'text' },
    { key: 'city', label: 'City', defaultValue: 'Nairobi', type: 'text' },
    { key: 'balance', label: 'Balance', defaultValue: '1000', type: 'number' },
    { key: 'status', label: 'Status', defaultValue: 'Active', type: 'select', options: ['Active', 'Inactive', 'Premium'] },
    { key: 'joinDate', label: 'Join Date', defaultValue: '2024-01-01', type: 'date' }
  ];

  const insertField = (field: PersonalizationField) => {
    const placeholder = `{{${field.key}}}`;
    const newMessage = message + placeholder;
    onMessageChange(newMessage);
    toast.success(`Added ${field.label} placeholder`);
  };

  const personalizeMessage = (messageText: string, contact: any = {}) => {
    let personalizedMessage = messageText;
    
    personalizationFields.forEach(field => {
      const placeholder = `{{${field.key}}}`;
      const value = contact[field.key] || field.defaultValue;
      personalizedMessage = personalizedMessage.replace(new RegExp(placeholder, 'g'), value);
    });

    return personalizedMessage;
  };

  const getPreviewContact = () => {
    if (contacts.length > 0) {
      return contacts[previewContact] || {};
    }
    
    // Sample contact for preview
    return {
      firstName: 'Jane',
      lastName: 'Smith',
      company: 'Tech Solutions Ltd',
      phone: '+254798765432',
      email: 'jane@techsolutions.com',
      city: 'Mombasa',
      balance: '2500',
      status: 'Premium',
      joinDate: '2023-06-15'
    };
  };

  const previewMessage = useMemo(() => {
    return personalizeMessage(message, getPreviewContact());
  }, [message, previewContact, contacts]);

  const detectedFields = useMemo(() => {
    const matches = message.match(/\{\{(\w+)\}\}/g) || [];
    return matches.map(match => match.replace(/[{}]/g, ''));
  }, [message]);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            Message Personalization
          </CardTitle>
          <CardDescription>
            Add dynamic fields to personalize messages for each contact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {personalizationFields.map((field, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => insertField(field)}
                className="justify-start text-left"
              >
                <Code className="w-3 h-3 mr-2" />
                <span className="text-xs">{field.label}</span>
              </Button>
            ))}
          </div>

          {detectedFields.length > 0 && (
            <div className="space-y-2">
              <Label>Detected Fields:</Label>
              <div className="flex flex-wrap gap-1">
                {detectedFields.map((field, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Message Preview
              </CardTitle>
              <CardDescription>
                See how your message will look with real data
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </div>
        </CardHeader>
        {showPreview && (
          <CardContent className="space-y-4">
            {contacts.length > 0 && (
              <div className="space-y-2">
                <Label>Preview Contact:</Label>
                <Select 
                  value={previewContact.toString()} 
                  onValueChange={(value) => setPreviewContact(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.slice(0, 10).map((contact, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {contact.firstName || 'Contact'} {contact.lastName || index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Personalized Message:</Label>
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="text-sm text-blue-800 whitespace-pre-wrap">
                  {previewMessage}
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Original Length:</strong> {message.length} chars
                </div>
                <div>
                  <strong>Preview Length:</strong> {previewMessage.length} chars
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
