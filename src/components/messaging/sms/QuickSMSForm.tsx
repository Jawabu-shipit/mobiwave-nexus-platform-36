
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, AlertCircle, CheckCircle, Users, Phone } from 'lucide-react';
import { validateAndFormatPhoneNumber, getValidPhoneNumbers } from '@/utils/phoneValidation';
import { ContactGroupSelector } from './ContactGroupSelector';
import { PhoneNumberListValidator } from './PhoneNumberValidator';
import { toast } from 'sonner';
import { TemplateManager } from './TemplateManager';
import { useSMSTemplates } from '@/hooks/useSMSTemplates';

interface QuickSMSFormProps {
  message: string;
  recipients: string[];
  newRecipient: string;
  scheduledFor: string;
  onMessageChange: (message: string) => void;
  onRecipientsChange: (recipients: string[]) => void;
  onNewRecipientChange: (recipient: string) => void;
  onScheduledForChange: (scheduledFor: string) => void;
  onAddRecipient: () => void;
  onRemoveRecipient: (phone: string) => void;
  showTemplateSelector?: boolean;
}

export function QuickSMSForm({
  message = "",
  recipients = [],
  newRecipient = "",
  scheduledFor = "",
  onMessageChange,
  onRecipientsChange,
  onNewRecipientChange,
  onScheduledForChange,
  onAddRecipient,
  onRemoveRecipient,
  showTemplateSelector = true
}: QuickSMSFormProps & { onRecipientsChange: (recipients: string[]) => void }) {
  const [phoneValidation, setPhoneValidation] = useState<{ isValid: boolean; message?: string }>({ isValid: true });
  const [recipientInputMethod, setRecipientInputMethod] = useState<'manual' | 'contacts'>('manual');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  const { templates, processTemplate } = useSMSTemplates();
  
  const characterCount = message.length;
  const smsCount = Math.ceil(characterCount / 160);

  const handleNewRecipientChange = (value: string) => {
    onNewRecipientChange(value);
    
    if (value.trim()) {
      const validation = validateAndFormatPhoneNumber(value);
      setPhoneValidation({
        isValid: validation.isValid,
        message: validation.errorMessage
      });
    } else {
      setPhoneValidation({ isValid: true });
    }
  };

  const handleAddRecipient = () => {
    if (!newRecipient.trim()) return;
    
    const validation = validateAndFormatPhoneNumber(newRecipient);
    
    if (validation.isValid && validation.formattedNumber) {
      // Check if already exists
      if (recipients.includes(validation.formattedNumber)) {
        toast.error('This phone number is already added');
        return;
      }
      
      // Use the formatted number
      onNewRecipientChange(''); // Clear input
      onAddRecipient(); // This will use the current newRecipient value
      
      // Update recipients with formatted number
      const updatedRecipients = [...recipients, validation.formattedNumber];
      // We need to call the parent's update function
      // For now, we'll let the parent handle the formatting
      setPhoneValidation({ isValid: true });
      toast.success('Phone number added successfully');
    } else {
      setPhoneValidation({
        isValid: false,
        message: validation.errorMessage
      });
      toast.error(validation.errorMessage || 'Invalid phone number');
    }
  };

  const handleContactsChange = (contacts: string[]) => {
    // Use the onRecipientsChange prop to directly set recipients
    onRecipientsChange(contacts);
  };

  const handleAddManualRecipient = (phone: string) => {
    if (!recipients.includes(phone)) {
      const updatedRecipients = [...recipients, phone];
      onRecipientsChange(updatedRecipients);
      toast.success('Contact added successfully');
    } else {
      toast.info('Contact already added');
    }
  };

  const handleRemoveInvalidNumbers = () => {
    const validNumbers = getValidPhoneNumbers(recipients);
    const removedCount = recipients.length - validNumbers.length;
    
    if (removedCount > 0) {
      onRecipientsChange(validNumbers);
      toast.success(`Removed ${removedCount} invalid phone number(s)`);
    } else {
      toast.info('No invalid phone numbers found');
    }
  };

  const handleTemplateSelect = (template: any) => {
    const processedMessage = processTemplate(template, {});
    onMessageChange(processedMessage);
    toast.success(`Template "${template.name}" applied`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Details</CardTitle>
        <CardDescription>
          Compose your SMS message and add recipients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showTemplateSelector && (
          <TemplateManager 
            onTemplateSelect={handleTemplateSelect}
            showTemplateSelector={true}
            selectedTemplateId={selectedTemplateId}
          />
        )}
        
        <Separator />
        
        <div>
          <Label htmlFor="message">Message *</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Type your SMS message here..."
            className="mt-1 min-h-24"
            rows={4}
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>Characters: {characterCount}</span>
            <span>SMS Count: {smsCount}</span>
          </div>
        </div>

        <Separator />

        {/* Recipient Selection Method */}
        <div>
          <Label>Add Recipients</Label>
          <Tabs value={recipientInputMethod} onValueChange={(value) => setRecipientInputMethod(value as 'manual' | 'contacts')} className="mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                From Contacts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="mt-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="newRecipient"
                      value={newRecipient}
                      onChange={(e) => handleNewRecipientChange(e.target.value)}
                      placeholder="Enter phone number (e.g., +254712345678, 0712345678)"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                      className={!phoneValidation.isValid ? 'border-red-500' : ''}
                    />
                    {!phoneValidation.isValid && phoneValidation.message && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {phoneValidation.message}
                      </div>
                    )}
                    {phoneValidation.isValid && newRecipient.trim() && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Valid phone number format
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={handleAddRecipient} 
                    disabled={!newRecipient.trim() || !phoneValidation.isValid}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Supported formats: +254712345678, 0712345678, 0112345678, 712345678
                </p>
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="mt-4">
              <ContactGroupSelector
                selectedContacts={recipients}
                onContactsChange={handleContactsChange}
                onAddManualRecipient={handleAddManualRecipient}
              />
            </TabsContent>
          </Tabs>
        </div>

        {recipients.length > 0 && (
          <div className="space-y-3">
            <Label>Recipients ({recipients.length})</Label>
            
            {/* Phone Number Validation Summary */}
            <PhoneNumberListValidator 
              phoneNumbers={recipients}
              onRemoveInvalid={handleRemoveInvalidNumbers}
            />
            
            {/* Recipients List */}
            <div className="flex flex-wrap gap-2">
              {recipients.map((phone) => {
                const validation = validateAndFormatPhoneNumber(phone);
                return (
                  <Badge 
                    key={phone} 
                    variant={validation.isValid ? "secondary" : "destructive"} 
                    className="flex items-center gap-1"
                  >
                    <span className="max-w-32 truncate">
                      {validation.isValid && validation.formattedNumber ? validation.formattedNumber : phone}
                    </span>
                    {!validation.isValid && (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveRecipient(phone)}
                      className="h-auto p-0 hover:bg-transparent ml-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        <Separator />

        <div>
          <Label htmlFor="scheduledFor">Schedule (Optional)</Label>
          <Input
            id="scheduledFor"
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => onScheduledForChange(e.target.value)}
            className="mt-1"
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
