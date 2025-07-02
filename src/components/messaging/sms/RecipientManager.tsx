
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, Users, Trash2, Plus, FileText } from 'lucide-react';
import { toast } from "sonner";

interface RecipientManagerProps {
  onRecipientsUpdate: (recipients: any[]) => void;
  recipients: any[];
}

export function RecipientManager({ onRecipientsUpdate, recipients }: RecipientManagerProps) {
  const [newRecipient, setNewRecipient] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const newRecipients = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          const recipient: any = { id: `imported-${Date.now()}-${index}` };
          
          headers.forEach((header, i) => {
            if (header.includes('first') || header.includes('fname')) {
              recipient.firstName = values[i] || '';
            } else if (header.includes('last') || header.includes('lname')) {
              recipient.lastName = values[i] || '';
            } else if (header.includes('phone') || header.includes('mobile')) {
              recipient.phone = values[i] || '';
            } else if (header.includes('email')) {
              recipient.email = values[i] || '';
            }
          });
          
          return recipient;
        }).filter(r => r.phone); // Only include recipients with phone numbers

        onRecipientsUpdate([...recipients, ...newRecipients]);
        toast.success(`Imported ${newRecipients.length} recipients successfully`);
      } catch (error) {
        toast.error('Failed to parse CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const addRecipient = () => {
    if (!newRecipient.phone) {
      toast.error('Phone number is required');
      return;
    }
    
    const recipient = {
      ...newRecipient,
      id: `manual-${Date.now()}`
    };
    
    onRecipientsUpdate([...recipients, recipient]);
    setNewRecipient({ firstName: '', lastName: '', phone: '', email: '' });
    toast.success('Recipient added successfully');
  };

  const removeRecipient = (id: string) => {
    onRecipientsUpdate(recipients.filter(r => r.id !== id));
    toast.success('Recipient removed');
  };

  const downloadTemplate = () => {
    const csvContent = 'firstName,lastName,phone,email\nJohn,Doe,+1234567890,john.doe@example.com\nJane,Smith,+0987654321,jane.smith@example.com';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sms_recipients_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-600" />
              Upload Recipients
            </CardTitle>
            <CardDescription>
              Upload a CSV or Excel file with recipient information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your CSV file here, or click to browse
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mb-2"
              >
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <Button
              variant="ghost"
              onClick={downloadTemplate}
              className="w-full flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Add Individual Recipient
            </CardTitle>
            <CardDescription>
              Manually add recipients one by one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newRecipient.firstName}
                  onChange={(e) => setNewRecipient({ ...newRecipient, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newRecipient.lastName}
                  onChange={(e) => setNewRecipient({ ...newRecipient, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={newRecipient.phone}
                onChange={(e) => setNewRecipient({ ...newRecipient, phone: e.target.value })}
                placeholder="+1234567890"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newRecipient.email}
                onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>
            <Button onClick={addRecipient} className="w-full">
              Add Recipient
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Recipients List
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {recipients.length} total
            </Badge>
          </CardTitle>
          <CardDescription>
            Review and manage your recipient list
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recipients.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.map((recipient) => (
                    <TableRow key={recipient.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {recipient.firstName || recipient.lastName ? 
                          `${recipient.firstName} ${recipient.lastName}`.trim() : 
                          'No name'
                        }
                      </TableCell>
                      <TableCell>{recipient.phone}</TableCell>
                      <TableCell>{recipient.email || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRecipient(recipient.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recipients added yet</p>
              <p className="text-sm text-gray-400">Upload a CSV file or add recipients manually</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
