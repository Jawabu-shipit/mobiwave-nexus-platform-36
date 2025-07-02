
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import { Shield, Smartphone, Key, AlertTriangle, CheckCircle } from 'lucide-react';

export function TwoFactorAuth() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showQRCode, setShowQRCode] = useState(false);

  const handleEnable2FA = () => {
    setShowQRCode(true);
    // Generate backup codes
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
  };

  const handleVerify = () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    setIsEnabled(true);
    setShowQRCode(false);
    toast.success('Two-factor authentication enabled successfully');
  };

  const handleDisable = () => {
    setIsEnabled(false);
    setBackupCodes([]);
    toast.success('Two-factor authentication disabled');
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Two-Factor Authentication</h2>
        <p className="text-gray-600">Add an extra layer of security to your account</p>
      </div>

      {/* 2FA Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Authentication Status
          </CardTitle>
          <CardDescription>
            Current two-factor authentication status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEnabled ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className="font-medium">
                  Two-Factor Authentication is {isEnabled ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-sm text-gray-600">
                  {isEnabled 
                    ? 'Your account is protected with 2FA' 
                    : 'Enable 2FA to secure your account'
                  }
                </p>
              </div>
            </div>
            <Badge variant={isEnabled ? 'default' : 'destructive'}>
              {isEnabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {!isEnabled && !showQRCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Enable Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Secure your account with time-based one-time passwords (TOTP)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Before you start:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>• Keep your device accessible during setup</li>
                <li>• Save backup codes in a secure location</li>
              </ul>
            </div>
            <Button onClick={handleEnable2FA}>
              Enable Two-Factor Authentication
            </Button>
          </CardContent>
        </Card>
      )}

      {showQRCode && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Your Authenticator</CardTitle>
            <CardDescription>
              Scan the QR code with your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code Placeholder */}
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto">
                <p className="text-gray-500">QR Code would appear here</p>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Secret Key: ABCD-EFGH-IJKL-MNOP-QRST-UVWX
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Enter Verification Code</Label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
              <Button onClick={handleVerify} disabled={verificationCode.length !== 6}>
                Verify and Enable
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isEnabled && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Backup Codes
              </CardTitle>
              <CardDescription>
                Use these codes if you lose access to your authenticator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {backupCodes.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-white rounded border">
                        {code}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={downloadBackupCodes} variant="outline">
                      Download Codes
                    </Button>
                    <Button variant="outline">
                      Regenerate Codes
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disable Two-Factor Authentication</CardTitle>
              <CardDescription>
                Remove 2FA protection from your account (not recommended)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">
                  <strong>Warning:</strong> Disabling 2FA will make your account less secure.
                </p>
              </div>
              <Button variant="destructive" onClick={handleDisable}>
                Disable Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
