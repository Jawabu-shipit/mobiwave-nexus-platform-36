import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PhoneNumberValidator, PhoneNumberListValidator } from '../messaging/sms/PhoneNumberValidator';
import { validateAndFormatPhoneNumber, getValidPhoneNumbers } from '@/utils/phoneValidation';
import { CheckCircle, AlertCircle, Phone, TestTube } from 'lucide-react';

export function PhoneValidationDemo() {
  const [testPhone, setTestPhone] = useState('');
  const [phoneList, setPhoneList] = useState<string[]>([
    '+254712345678',
    '0712345678',
    '0112345678',
    '712345678',
    'invalid',
    '071234567', // too short
    '+255712345678', // wrong country
    '0512345678' // invalid prefix
  ]);

  const testCases = [
    { input: '+254712345678', description: 'International format' },
    { input: '0712345678', description: 'Local format with 07' },
    { input: '0112345678', description: 'Local format with 01' },
    { input: '712345678', description: 'Without leading zero (7)' },
    { input: '112345678', description: 'Without leading zero (1)' },
    { input: '254712345678', description: 'Without + sign' },
    { input: ' +254 712 345 678 ', description: 'With spaces' },
    { input: '+254-712-345-678', description: 'With dashes' },
    { input: 'invalid', description: 'Invalid text' },
    { input: '071234567', description: 'Too short' },
    { input: '07123456789', description: 'Too long' },
    { input: '+255712345678', description: 'Wrong country code' },
    { input: '0512345678', description: 'Invalid prefix (05)' },
    { input: '', description: 'Empty string' },
  ];

  const addToPhoneList = () => {
    if (testPhone.trim() && !phoneList.includes(testPhone.trim())) {
      setPhoneList([...phoneList, testPhone.trim()]);
      setTestPhone('');
    }
  };

  const removeFromPhoneList = (phone: string) => {
    setPhoneList(phoneList.filter(p => p !== phone));
  };

  const removeInvalidNumbers = () => {
    const validNumbers = getValidPhoneNumbers(phoneList);
    setPhoneList(validNumbers);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <TestTube className="w-8 h-8" />
          Phone Number Validation Demo
        </h1>
        <p className="text-gray-600 mt-2">
          Test Kenyan phone number validation and formatting
        </p>
      </div>

      {/* Single Phone Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Single Phone Number Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="Enter phone number to test..."
              className="flex-1"
            />
            <Button onClick={addToPhoneList} disabled={!testPhone.trim()}>
              Add to List
            </Button>
          </div>
          
          {testPhone && (
            <PhoneNumberValidator phoneNumber={testPhone} />
          )}
        </CardContent>
      </Card>

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testCases.map((testCase, index) => {
              const validation = validateAndFormatPhoneNumber(testCase.input);
              return (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{testCase.description}</Label>
                    {validation.isValid ? (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Valid
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Invalid
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-mono bg-gray-100 p-2 rounded">
                      Input: "{testCase.input}"
                    </div>
                    
                    {validation.isValid ? (
                      <div className="font-mono bg-green-50 p-2 rounded mt-1 text-green-800">
                        Output: "{validation.formattedNumber}"
                      </div>
                    ) : (
                      <div className="font-mono bg-red-50 p-2 rounded mt-1 text-red-800">
                        Error: {validation.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Phone List Management */}
      <Card>
        <CardHeader>
          <CardTitle>Phone Number List Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PhoneNumberListValidator 
            phoneNumbers={phoneList}
            onRemoveInvalid={removeInvalidNumbers}
          />
          
          <Separator />
          
          <div>
            <Label>Phone Numbers ({phoneList.length})</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {phoneList.map((phone, index) => {
                const validation = validateAndFormatPhoneNumber(phone);
                return (
                  <Badge 
                    key={index}
                    variant={validation.isValid ? "secondary" : "destructive"}
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => removeFromPhoneList(phone)}
                  >
                    {validation.isValid && validation.formattedNumber ? validation.formattedNumber : phone}
                    {!validation.isValid && <AlertCircle className="w-3 h-3" />}
                  </Badge>
                );
              })}
            </div>
            {phoneList.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Click on a phone number to remove it from the list
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{phoneList.length}</div>
              <div className="text-sm text-gray-600">Total Numbers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getValidPhoneNumbers(phoneList).length}
              </div>
              <div className="text-sm text-gray-600">Valid Numbers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {phoneList.length - getValidPhoneNumbers(phoneList).length}
              </div>
              <div className="text-sm text-gray-600">Invalid Numbers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {phoneList.length > 0 ? Math.round((getValidPhoneNumbers(phoneList).length / phoneList.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}