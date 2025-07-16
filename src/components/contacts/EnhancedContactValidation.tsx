import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Phone, Users } from 'lucide-react';
import { validateAndFormatPhoneNumber, getValidPhoneNumbers } from '@/utils/phoneValidation';
import { Contact } from '@/hooks/contacts/useContactsData';
import { toast } from 'sonner';

interface EnhancedContactValidationProps {
  contacts: Contact[];
  onFixContacts?: (fixedContacts: Contact[]) => void;
}

export function EnhancedContactValidation({ contacts, onFixContacts }: EnhancedContactValidationProps) {
  const validateContacts = () => {
    const validContacts: Contact[] = [];
    const invalidContacts: Contact[] = [];
    const fixableContacts: Contact[] = [];

    contacts.forEach(contact => {
      const validation = validateAndFormatPhoneNumber(contact.phone);
      
      if (validation.isValid && validation.formattedNumber) {
        validContacts.push({
          ...contact,
          phone: validation.formattedNumber
        });
      } else {
        invalidContacts.push(contact);
        
        // Check if it's fixable (has digits but wrong format)
        const digitsOnly = contact.phone.replace(/\D/g, '');
        if (digitsOnly.length >= 9) {
          fixableContacts.push(contact);
        }
      }
    });

    return { validContacts, invalidContacts, fixableContacts };
  };

  const { validContacts, invalidContacts, fixableContacts } = validateContacts();
  const validationRate = contacts.length > 0 ? (validContacts.length / contacts.length) * 100 : 0;

  const handleFixContacts = () => {
    const fixedContacts = fixableContacts.map(contact => {
      const digitsOnly = contact.phone.replace(/\D/g, '');
      
      // Try different formats
      let fixedPhone = contact.phone;
      
      // If starts with 07 or 01, convert to +254
      if (digitsOnly.startsWith('07') || digitsOnly.startsWith('01')) {
        fixedPhone = '+254' + digitsOnly.substring(1);
      }
      // If starts with 254, add +
      else if (digitsOnly.startsWith('254')) {
        fixedPhone = '+' + digitsOnly;
      }
      // If starts with 7 or 1 and is 9 digits, add +254
      else if ((digitsOnly.startsWith('7') || digitsOnly.startsWith('1')) && digitsOnly.length === 9) {
        fixedPhone = '+254' + digitsOnly;
      }

      const validation = validateAndFormatPhoneNumber(fixedPhone);
      
      return {
        ...contact,
        phone: validation.isValid && validation.formattedNumber ? validation.formattedNumber : contact.phone
      };
    });

    const actuallyFixed = fixedContacts.filter(contact => {
      const validation = validateAndFormatPhoneNumber(contact.phone);
      return validation.isValid;
    });

    if (actuallyFixed.length > 0 && onFixContacts) {
      onFixContacts(actuallyFixed);
      toast.success(`Fixed ${actuallyFixed.length} phone numbers`);
    } else {
      toast.info('No phone numbers could be automatically fixed');
    }
  };

  const getValidationColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-blue-600" />
          Contact Validation Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-blue-50">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700">{contacts.length}</div>
            <div className="text-sm text-blue-600">Total Contacts</div>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-green-50">
            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700">{validContacts.length}</div>
            <div className="text-sm text-green-600">Valid Numbers</div>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-red-50">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold text-red-700">{invalidContacts.length}</div>
            <div className="text-sm text-red-600">Invalid Numbers</div>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-yellow-50">
            <Phone className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-700">{fixableContacts.length}</div>
            <div className="text-sm text-yellow-600">Fixable Numbers</div>
          </div>
        </div>

        {/* Validation Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Validation Rate</span>
            <span className={`text-sm font-bold ${getValidationColor(validationRate)}`}>
              {validationRate.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={validationRate} 
            className="h-2"
          />
        </div>

        {/* Actions */}
        {fixableContacts.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={handleFixContacts} variant="outline">
              <Phone className="w-4 h-4 mr-2" />
              Auto-Fix {fixableContacts.length} Numbers
            </Button>
          </div>
        )}

        {/* Invalid Contacts Details */}
        {invalidContacts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-700">Invalid Phone Numbers:</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {invalidContacts.slice(0, 10).map((contact) => (
                <div key={contact.id} className="flex justify-between items-center text-sm">
                  <span>{contact.first_name} {contact.last_name}</span>
                  <Badge variant="destructive" className="text-xs">
                    {contact.phone}
                  </Badge>
                </div>
              ))}
              {invalidContacts.length > 10 && (
                <div className="text-sm text-gray-500">
                  ...and {invalidContacts.length - 10} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validation Rules */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Validation Rules:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Numbers must be Kenyan (+254 country code)</li>
            <li>• Format: +254XXXXXXXXX (13 digits total)</li>
            <li>• Mobile numbers start with 7 or 1</li>
            <li>• Accepted formats: +254712345678, 0712345678, 712345678</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}