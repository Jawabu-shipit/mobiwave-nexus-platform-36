import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { validateAndFormatPhoneNumber } from '@/utils/phoneValidation';

interface PhoneNumberValidatorProps {
  phoneNumber: string;
  showFormatted?: boolean;
  className?: string;
}

export function PhoneNumberValidator({ 
  phoneNumber, 
  showFormatted = true, 
  className = "" 
}: PhoneNumberValidatorProps) {
  const validation = validateAndFormatPhoneNumber(phoneNumber);
  
  if (!phoneNumber.trim()) {
    return null;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        <span className={validation.isValid ? 'text-gray-900' : 'text-red-600'}>
          {phoneNumber}
        </span>
        
        {validation.isValid ? (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Valid
          </Badge>
        ) : (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            Invalid
          </Badge>
        )}
        
        {validation.isValid && 
         validation.formattedNumber && 
         validation.formattedNumber !== phoneNumber && 
         showFormatted && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <ArrowRight className="w-3 h-3" />
            <span className="font-medium">{validation.formattedNumber}</span>
          </div>
        )}
      </div>
      
      {!validation.isValid && validation.errorMessage && (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="w-3 h-3" />
          {validation.errorMessage}
        </div>
      )}
    </div>
  );
}

interface PhoneNumberListValidatorProps {
  phoneNumbers: string[];
  onRemoveInvalid?: () => void;
}

export function PhoneNumberListValidator({ 
  phoneNumbers, 
  onRemoveInvalid 
}: PhoneNumberListValidatorProps) {
  const validNumbers = phoneNumbers.filter(phone => 
    validateAndFormatPhoneNumber(phone).isValid
  );
  const invalidNumbers = phoneNumbers.filter(phone => 
    !validateAndFormatPhoneNumber(phone).isValid
  );

  if (phoneNumbers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <CheckCircle className="w-3 h-3 mr-1" />
            {validNumbers.length} Valid
          </Badge>
          
          {invalidNumbers.length > 0 && (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              {invalidNumbers.length} Invalid
            </Badge>
          )}
        </div>
        
        {invalidNumbers.length > 0 && onRemoveInvalid && (
          <button
            onClick={onRemoveInvalid}
            className="text-xs text-red-600 hover:text-red-800 underline"
          >
            Remove Invalid Numbers
          </button>
        )}
      </div>
      
      {invalidNumbers.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800 mb-2">
            Invalid Phone Numbers:
          </p>
          <div className="space-y-1">
            {invalidNumbers.map((phone, index) => {
              const validation = validateAndFormatPhoneNumber(phone);
              return (
                <div key={index} className="text-xs text-red-700">
                  <span className="font-medium">{phone}</span>
                  {validation.errorMessage && (
                    <span className="ml-2">- {validation.errorMessage}</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            <p className="font-medium mb-1">Supported formats:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>+254712345678 (International format)</li>
              <li>0712345678 (Local format with leading zero)</li>
              <li>0112345678 (Landline format)</li>
              <li>712345678 (Without leading zero)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}