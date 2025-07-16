
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Upload, Download, FileText, Users } from 'lucide-react';
import { Contact } from '@/hooks/contacts/useContactsData';

interface ContactImportExportProps {
  contacts: Contact[];
  onImport: (contacts: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => Promise<any>;
}

export function ContactImportExport({ contacts, onImport }: ContactImportExportProps) {
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const contactsToImport = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim());
          const contact: any = {
            first_name: '',
            last_name: '',
            phone: '',
            email: '',
            tags: [],
            custom_fields: {},
            is_active: true
          };
          
          headers.forEach((header, index) => {
            const value = values[index]?.replace(/"/g, '') || '';
            switch (header.toLowerCase()) {
              case 'first_name':
              case 'firstname':
                contact.first_name = value;
                break;
              case 'last_name':
              case 'lastname':
                contact.last_name = value;
                break;
              case 'phone':
              case 'mobile':
                contact.phone = value;
                break;
              case 'email':
                contact.email = value;
                break;
              default:
                if (value) {
                  contact.custom_fields[header] = value;
                }
            }
          });
          
          return contact;
        })
        .filter(contact => contact.phone);

      await onImport(contactsToImport);
      toast.success(`Successfully imported ${contactsToImport.length} contacts`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import contacts');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = () => {
    if (contacts.length === 0) {
      toast.error('No contacts to export');
      return;
    }

    const headers = ['first_name', 'last_name', 'phone', 'email', 'tags'];
    const csvContent = [
      headers.join(','),
      ...contacts.map(contact => [
        contact.first_name || '',
        contact.last_name || '',
        contact.phone,
        contact.email || '',
        (contact.tags || []).join(';')
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`Exported ${contacts.length} contacts`);
  };

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Import & Export Contacts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Import Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Import Contacts</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload a CSV file with columns: first_name, last_name, phone, email
              </p>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
                disabled={isImporting}
              />
              <Label htmlFor="csv-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="text-sm font-medium">
                    {isImporting ? 'Importing...' : 'Click to upload CSV file'}
                  </p>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </div>
              </Label>
            </div>
          </div>

          {/* Export Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Export Contacts</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download all your contacts as a CSV file
              </p>
            </div>
            
            <div className="border rounded-lg p-6 text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-3 rounded-full bg-green-50">
                  <Download className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div>
                <p className="font-medium">{contacts.length} contacts ready</p>
                <p className="text-sm text-gray-500">Export as CSV format</p>
              </div>
              <Button onClick={handleExport} disabled={contacts.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export Contacts
              </Button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Import Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ensure your CSV has headers: first_name, last_name, phone, email</li>
            <li>• Phone numbers should include country code (e.g., +254...)</li>
            <li>• Duplicate phone numbers will be skipped</li>
            <li>• Additional columns will be stored as custom fields</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
