
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Users, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedRecipientManagerProps {
  recipients: any[];
  onRecipientsUpdate: (recipients: any[]) => void;
  showImportOptions?: boolean;
  showGroupManagement?: boolean;
}

export function EnhancedRecipientManager({ 
  recipients, 
  onRecipientsUpdate, 
  showImportOptions = false, 
  showGroupManagement = false 
}: EnhancedRecipientManagerProps) {
  const [newRecipient, setNewRecipient] = useState('');

  const addRecipient = () => {
    if (newRecipient.trim()) {
      const phone = newRecipient.trim();
      if (!recipients.some(r => (typeof r === 'string' ? r : r.phone) === phone)) {
        onRecipientsUpdate([...recipients, phone]);
        setNewRecipient('');
        toast.success('Recipient added');
      } else {
        toast.error('Recipient already exists');
      }
    }
  };

  const removeRecipient = (index: number) => {
    onRecipientsUpdate(recipients.filter((_, i) => i !== index));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simulate CSV processing
    toast.success(`Processing ${file.name}...`);
    
    // Mock adding recipients from CSV
    setTimeout(() => {
      const mockRecipients = [
        '+254712345678',
        '+254723456789',
        '+254734567890'
      ];
      onRecipientsUpdate([...recipients, ...mockRecipients]);
      toast.success(`Added ${mockRecipients.length} recipients from ${file.name}`);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Recipient Manager
        </CardTitle>
        <CardDescription>
          Add and manage SMS recipients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newRecipient}
            onChange={(e) => setNewRecipient(e.target.value)}
            placeholder="Enter phone number"
            onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
          />
          <Button onClick={addRecipient}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {showImportOptions && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Upload CSV file</p>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="max-w-xs mx-auto"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Recipients ({recipients.length})</Label>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">
                  {typeof recipient === 'string' ? recipient : recipient.phone || recipient}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeRecipient(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {recipients.length > 0 && (
          <div className="text-sm text-gray-500">
            Total recipients: {recipients.length}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
