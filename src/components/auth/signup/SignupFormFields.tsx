
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from './PasswordInput';
import { PasswordRequirements } from './PasswordRequirements';
import { ValidationSchemas } from '@/components/security/EnhancedInputValidator';

interface SignupFormFieldsProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
}

export function SignupFormFields({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword
}: SignupFormFieldsProps) {
  
  const handleNameChange = (value: string, setter: (value: string) => void) => {
    try {
      const sanitized = ValidationSchemas.name.parse(value);
      setter(sanitized);
    } catch (error) {
      // If validation fails, still update but log the issue
      console.warn('Name validation failed:', error);
      setter(value);
    }
  };

  const handleEmailChange = (value: string) => {
    try {
      const sanitized = ValidationSchemas.email.parse(value);
      setEmail(sanitized);
    } catch (error) {
      // Still update for real-time feedback, validation happens on submit
      setEmail(value);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => handleNameChange(e.target.value, setFirstName)}
            required
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => handleNameChange(e.target.value, setLastName)}
            required
            maxLength={100}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          required
          maxLength={255}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          showPassword={showPassword}
          onToggleVisibility={() => setShowPassword(!showPassword)}
          required
        />
        
        <PasswordRequirements password={password} />
      </div>

      <div className="space-y-2">
        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          showPassword={showConfirmPassword}
          onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
          required
        />
        {confirmPassword && password !== confirmPassword && (
          <p className="text-sm text-red-600">Passwords do not match</p>
        )}
      </div>
    </>
  );
}
