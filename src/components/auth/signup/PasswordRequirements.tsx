
import React from 'react';
import { Check, X } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'Contains number', test: (pwd) => /\d/.test(pwd) },
  { label: 'Contains special character', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const getPasswordStrength = (password: string): number => {
    const satisfiedRequirements = passwordRequirements.filter(req => req.test(password)).length;
    return (satisfiedRequirements / passwordRequirements.length) * 100;
  };

  const passwordStrength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Password strength:</span>
        <Progress value={passwordStrength} className="flex-1" />
        <span className="text-sm text-gray-600">{Math.round(passwordStrength)}%</span>
      </div>
      
      <div className="space-y-1">
        {passwordRequirements.map((req, index) => {
          const satisfied = req.test(password);
          return (
            <div key={index} className="flex items-center space-x-2 text-sm">
              {satisfied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-red-500" />
              )}
              <span className={satisfied ? 'text-green-600' : 'text-red-600'}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { passwordRequirements };
