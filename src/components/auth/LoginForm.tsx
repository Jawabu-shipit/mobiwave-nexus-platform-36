
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginFormFields } from './login/LoginFormFields';
import { LoginErrorDisplay } from './login/LoginErrorDisplay';
import { useLoginHandler } from './login/useLoginHandler';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { isLoading, error, accountLocked, handleSubmit } = useLoginHandler();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(email, password);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <LoginErrorDisplay error={error} accountLocked={accountLocked} />

          <LoginFormFields
            email={email}
            password={password}
            showPassword={showPassword}
            accountLocked={accountLocked}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || accountLocked}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
