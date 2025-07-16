
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

interface LoginErrorDisplayProps {
  error: string;
  accountLocked: boolean;
}

export function LoginErrorDisplay({ error, accountLocked }: LoginErrorDisplayProps) {
  if (!error && !accountLocked) return null;

  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {accountLocked && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            For security reasons, this account has been temporarily locked. 
            If you believe this is an error, please contact support.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
