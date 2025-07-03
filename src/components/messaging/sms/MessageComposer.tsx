
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TemplateManager } from './TemplateManager';
import { useSMSTemplates } from '@/hooks/useSMSTemplates';
import { MessageSquare, FileText, User } from 'lucide-react';
import { toast } from 'sonner';

interface MessageComposerProps {
  message: string;
  onMessageChange: (message: string) => void;
  showPersonalization?: boolean;
  showTemplates?: boolean;
}

export function MessageComposer({ 
  message, 
  onMessageChange, 
  showPersonalization = false, 
  showTemplates = false 
}: MessageComposerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  const { processTemplate } = useSMSTemplates();

  const templates = [
    { id: 'welcome', name: 'Welcome Message', content: 'Welcome to our service! We\'re excited to have you on board.' },
    { id: 'promo', name: 'Promotional Offer', content: 'Special offer just for you! Get 20% off your next purchase. Use code SAVE20.' },
    { id: 'reminder', name: 'Appointment Reminder', content: 'Reminder: You have an appointment scheduled for tomorrow at 2 PM.' }
  ];

  const personalizationTags = [
    { tag: '{first_name}', description: 'Recipient\'s first name' },
    { tag: '{last_name}', description: 'Recipient\'s last name' },
    { tag: '{phone}', description: 'Recipient\'s phone number' }
  ];

  const handleLegacyTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onMessageChange(template.content);
      setSelectedTemplate(templateId);
    }
  };

  const insertPersonalizationTag = (tag: string) => {
    const newMessage = message + tag;
    onMessageChange(newMessage);
  };

  const smsCount = Math.ceil(message.length / 160);

  const handleTemplateSelect = (template: any) => {
    const processedMessage = processTemplate(template, {});
    onMessageChange(processedMessage);
    setSelectedTemplateId(template.id);
    toast.success(`Template "${template.name}" applied`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Message Composer
        </CardTitle>
        <CardDescription>
          Compose your SMS message
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showTemplates && (
          <TemplateManager 
            onTemplateSelect={handleTemplateSelect}
            showTemplateSelector={true}
            selectedTemplateId={selectedTemplateId}
          />
        )}
        

        <div>
          <Label htmlFor="message">Message Content *</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Enter your SMS message..."
            className="min-h-[120px]"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-gray-500">
              {message.length}/160 characters
            </div>
            <Badge variant={smsCount > 1 ? 'destructive' : 'default'}>
              {smsCount} SMS
            </Badge>
          </div>
        </div>

        {showPersonalization && (
          <div>
            <Label>Personalization Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {personalizationTags.map(tag => (
                <Button
                  key={tag.tag}
                  size="sm"
                  variant="outline"
                  onClick={() => insertPersonalizationTag(tag.tag)}
                  className="text-xs"
                >
                  <User className="w-3 h-3 mr-1" />
                  {tag.tag}
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Click to insert personalization tags into your message
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
